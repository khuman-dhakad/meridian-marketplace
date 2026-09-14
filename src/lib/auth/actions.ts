"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { registerSchema, loginSchema } from "../validations/auth";
import {
  createListingSchema,
  moderateListingSchema,
  deleteListingSchema,
} from "../validations/listing";
import { hashPassword, verifyPassword } from "./password";
import {
  createSession,
  destroySession,
  getSession,
  requireAuth,
  requireRole,
} from "./session";
import {
  getUserByEmail,
  createUser,
  createListing as repoCreateListing,
  moderateListing,
  deleteListing,
} from "../data/repository";
import { prisma } from "../db/prisma";
import { Role } from "@prisma/client";

export interface ActionResponse {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server Action for User Registration.
 * Strictly validated server-side. Fails closed if PostgreSQL is unreachable.
 */
export async function registerAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    accountType: formData.get("accountType") || "personal",
    businessName: formData.get("businessName") || undefined,
  };

  // 1. Server-side validation with Zod
  const validation = registerSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {};
    validation.error.errors.forEach((err) => {
      const field = err.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(err.message);
    });
    return {
      error: "Please correct the highlighted errors.",
      fieldErrors,
    };
  }

  const { name, email, password, accountType, businessName } = validation.data;

  try {
    // 2. Duplicate email check
    const existing = await getUserByEmail(email);
    if (existing) {
      return {
        error: "An account with this email address already exists. Please sign in instead.",
      };
    }

    // 3. Password hashing
    const passwordHash = await hashPassword(password);

    // 4. User creation with profile
    const role = accountType === "business" ? Role.BUSINESS : Role.USER;
    const user = await createUser({
      name,
      email,
      passwordHash,
      role,
      businessName,
    });

    // 5. Establish secure session (raw token stored only in HTTP-only cookie, SHA-256 in DB)
    await createSession(user.id);
  } catch (err) {
    console.error("[Auth Action] Registration failed:", err);
    return {
      error:
        "Authentication service is temporarily unavailable. Please try again shortly.",
    };
  }

  redirect("/dashboard");
}

/**
 * Server Action for User Login.
 * Strictly validated server-side. Fails closed if PostgreSQL is unreachable.
 */
export async function loginAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: "Please provide a valid email and password." };
  }

  const { email, password } = validation.data;
  let userId: string | null = null;

  try {
    // 1. Query user by normalized email
    const user = await getUserByEmail(email);
    if (!user) {
      return { error: "Invalid email or password." };
    }

    // 2. Check active status
    if (!user.isActive) {
      return {
        error: "This account has been deactivated. Please contact support.",
      };
    }

    // 3. Verify bcrypt password hash
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Invalid email or password." };
    }

    userId = user.id;

    // 4. Update last login timestamp in background
    prisma.user
      .update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
      .catch(() => {});

    // 5. Establish secure session
    await createSession(user.id);
  } catch (err) {
    console.error("[Auth Action] Login failed:", err);
    return {
      error:
        "Authentication service is temporarily unavailable. Please try again shortly.",
    };
  }

  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";
  redirect(callbackUrl);
}

/**
 * Server Action for Session Termination (Logout).
 */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

/**
 * Server Action for Creating a Classified Listing.
 * Bound strictly to authenticated session sellerId. Fails closed if DB unreachable.
 */
export async function createListingAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  // 1. Authenticate user from server session
  const session = await getSession();
  if (!session) {
    return { error: "You must be signed in to publish a classified listing." };
  }

  // 2. Parse form fields
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    priceType: formData.get("priceType") || "fixed",
    categorySlug: formData.get("categorySlug"),
    locationSlug: formData.get("locationSlug"),
    isNegotiable: formData.get("isNegotiable") === "on" || formData.get("isNegotiable") === "true",
    contactPhone: formData.get("contactPhone") || undefined,
  };

  // 3. Validate server-side with Zod
  const validation = createListingSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {};
    validation.error.errors.forEach((err) => {
      const field = err.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(err.message);
    });
    return {
      error: "Please complete all required fields correctly.",
      fieldErrors,
    };
  }

  // 4. Persist to database via repository
  try {
    const listing = await repoCreateListing(validation.data, session.id);
    return {
      success: true,
      error: undefined,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unable to save listing.";
    return { error: msg };
  }
}

/**
 * Server Action for Moderating a Classified Listing.
 * Enforces server-side MODERATOR or ADMIN role authorization.
 * Fails closed if PostgreSQL is unreachable.
 */
export async function moderateListingAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  // 1. Authenticate and verify role server-side
  let session;
  try {
    session = await requireRole([Role.ADMIN, Role.MODERATOR]);
  } catch {
    return { error: "Unauthorized: Staff moderation privileges required." };
  }

  // 2. Parse and validate form fields
  const rawData = {
    listingId: formData.get("listingId"),
    decision: formData.get("decision"),
    reason: formData.get("reason") || undefined,
  };

  const validation = moderateListingSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: "Invalid moderation request data." };
  }

  const { listingId, decision } = validation.data;

  // 3. Perform mutation via repository (verifies target record post-authorization)
  try {
    await moderateListing(listingId, decision, session.role);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Failed to update listing moderation status.";
    return { error: msg };
  }
}

/**
 * Server Action for Deleting a Classified Listing.
 * Enforces server-side ownership or ADMIN role authorization.
 * Fails closed if PostgreSQL is unreachable.
 */
export async function deleteListingAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  // 1. Authenticate user from session
  let session;
  try {
    session = await requireAuth();
  } catch {
    return { error: "Authentication required to delete a listing." };
  }

  // 2. Parse and validate listing ID
  const rawData = {
    listingId: formData.get("listingId"),
  };

  const validation = deleteListingSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: "Invalid listing ID." };
  }

  const { listingId } = validation.data;

  // 3. Perform deletion with IDOR check in repository
  try {
    await deleteListing(listingId, session.id, session.role);
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Failed to delete listing.";
    return { error: msg };
  }
}

/**
 * Direct form action handler for listing moderation from Server Components.
 */
export async function handleModerateListingAction(formData: FormData): Promise<void> {
  await moderateListingAction(null, formData);
}

/**
 * Direct form action handler for listing deletion from Server Components.
 */
export async function handleDeleteListingAction(formData: FormData): Promise<void> {
  await deleteListingAction(null, formData);
}
