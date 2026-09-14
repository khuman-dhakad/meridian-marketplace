import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "../db/prisma";
import { Role } from "@prisma/client";
import { AuthenticationError, AuthorizationError } from "../errors";

export const SESSION_COOKIE_NAME = "meridian_session";
// Session expires in 7 days
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  displayName?: string | null;
  avatar?: string | null;
  isVerified?: boolean;
}

/**
 * Computes a deterministic one-way SHA-256 hash of a raw session token.
 * Only this hash is stored in PostgreSQL (Session.tokenHash).
 */
export function hashSessionToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Creates a new secure session for a user.
 * - Generates 256 bits of cryptographically secure randomness.
 * - Hashes the token using SHA-256 and persists Session.tokenHash to PostgreSQL.
 * - Sets the raw token in an HTTP-only, secure, SameSite=Lax cookie.
 * - FAILS CLOSED: If the database is unreachable, throws a controlled error without setting a cookie.
 */
export async function createSession(
  userId: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  // 1. Generate 256 bits (32 bytes) of cryptographic randomness
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // 2. Persist to database (Fails closed on connection failure)
  try {
    await prisma.session.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });
  } catch (err: unknown) {
    // Controlled server-side error logging: Never leak credentials or stack trace to client
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[Session] Database error during session persistence:", errorMessage);
    throw new Error("Authentication service temporarily unavailable. Please try again shortly.");
  }

  // 3. Set HTTP-only secure cookie
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: rawToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    expires: expiresAt,
  });
}

/**
 * Reads and verifies the current session from the HTTP-only cookie.
 * - Hashes the presented token and queries PostgreSQL by tokenHash.
 * - Verifies expiration and ensures user is active.
 * - FAILS CLOSED: Returns null if database is unreachable or session is invalid.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken || typeof rawToken !== "string") {
    return null;
  }

  const tokenHash = hashSessionToken(rawToken);

  try {
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check expiration
    if (session.expiresAt.getTime() <= Date.now()) {
      // Expired: Clean up in background and reject
      prisma.session.delete({ where: { tokenHash } }).catch(() => {});
      return null;
    }

    // Check user active status
    if (!session.user || !session.user.isActive) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      displayName: session.user.profile?.displayName || session.user.name,
      avatar: session.user.profile?.avatar || null,
      isVerified: session.user.profile?.isVerified || false,
    };
  } catch (err: unknown) {
    // Fail closed: Never pretend authentication succeeded if database is offline
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[Session] Failed to verify session against database:", msg);
    return null;
  }
}

/**
 * Terminates the active session:
 * - Deletes the session record from PostgreSQL matching the token hash.
 * - Clears the HTTP-only cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    const tokenHash = hashSessionToken(rawToken);
    try {
      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    } catch {
      // Safe cleanup failure absorption
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Server-side route & action guard. Throws AuthenticationError if unauthenticated.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new AuthenticationError("Authentication required. Please sign in.");
  }
  return session;
}

/**
 * Server-side role-based authorization guard. Throws AuthorizationError if role not allowed.
 */
export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new AuthorizationError(
      `Access denied. Requires one of roles: ${allowedRoles.join(", ")}`
    );
  }
  return session;
}
