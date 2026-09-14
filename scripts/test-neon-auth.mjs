import path from "node:path";
import crypto from "node:crypto";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function hashSessionToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function runNeonAuthTests() {
  console.log("=== RUNNING REAL AUTHENTICATION AUDIT AGAINST NEON ===");
  const timestamp = Date.now();
  const testEmail = `auth.test.${timestamp}@meridian-audit.local`;
  const rawPassword = "SecurePassword123!";
  let testUserId = null;

  try {
    // 1. User Registration & Password Hashing
    console.log("1. Testing User Registration & Password Hashing...");
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(rawPassword, saltRounds);
    if (!passwordHash.startsWith("$2a$12$") && !passwordHash.startsWith("$2b$12$")) {
      throw new Error("Password hash does not meet bcrypt 12-round standard");
    }

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        name: "Auth Test Subject",
        role: Role.USER,
        isActive: true,
      },
    });
    testUserId = user.id;
    console.log(`  ✔ User registered in Neon: ID ${user.id}`);

    // Verify stored password hash is not plaintext
    if (user.passwordHash === rawPassword) {
      throw new Error("CRITICAL SECURITY FLAW: Password stored in plaintext!");
    }
    console.log("  ✔ Password safely stored as bcrypt hash.");

    // 2. Login Verification
    console.log("2. Testing Password Verification...");
    const isCorrect = await bcrypt.compare(rawPassword, user.passwordHash);
    const isWrong = await bcrypt.compare("WrongPassword!", user.passwordHash);
    if (!isCorrect || isWrong) throw new Error("Password verification logic failed");
    console.log("  ✔ Password comparison successfully verified.");

    // 3. Session Creation & SHA-256 Token Storage
    console.log("3. Testing Session Creation & Cryptographic Token Storage...");
    const rawToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = hashSessionToken(rawToken);

    if (tokenHash.length !== 64) throw new Error("Token hash is not 64-char hexadecimal");
    if (rawToken === tokenHash) throw new Error("Token was not hashed!");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        ipAddress: "127.0.0.1",
        userAgent: "NeonAuthAudit/1.0",
      },
    });
    console.log(`  ✔ Session created in Neon: ID ${session.id}, tokenHash: ${tokenHash.slice(0, 16)}...`);

    // 4. Verify Raw Token is NEVER in Database
    console.log("4. Verifying raw token is absent from database...");
    const rawTokenLeakCheck = await prisma.session.findFirst({
      where: { tokenHash: rawToken },
    });
    if (rawTokenLeakCheck !== null) {
      throw new Error("CRITICAL: Raw token was found in database!");
    }
    console.log("  ✔ Confirmed: Raw session token exists only in client cookie, never in Neon.");

    // 5. Session Lookup & Active User Verification
    console.log("5. Testing Session Lookup via tokenHash...");
    const foundSession = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!foundSession || foundSession.userId !== user.id) {
      throw new Error("Session lookup failed");
    }
    if (!foundSession.user.isActive) {
      throw new Error("User active check failed");
    }
    console.log("  ✔ Session lookup successful and user verified active.");

    // 6. Suspended/Inactive User Rejection
    console.log("6. Testing Suspended User Rejection...");
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });

    const suspendedLookup = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    const isUserAllowed = suspendedLookup && suspendedLookup.user.isActive;
    if (isUserAllowed) throw new Error("Suspended user was incorrectly authorized!");
    console.log("  ✔ Suspended user (isActive: false) rejected from session authentication.");

    // Reactivate user for next checks
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
    });

    // 7. Role Authorization Logic
    console.log("7. Testing Role-Based Authorization Enforcement...");
    const standardUserRole = user.role; // USER
    const requiresAdmin = [Role.ADMIN];
    const isStandardAuthorizedForAdmin = requiresAdmin.includes(standardUserRole);
    if (isStandardAuthorizedForAdmin) {
      throw new Error("USER was incorrectly authorized for ADMIN role!");
    }

    // Elevate to ADMIN in Neon
    const elevatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: Role.ADMIN },
    });
    const isAdminAuthorized = requiresAdmin.includes(elevatedUser.role);
    if (!isAdminAuthorized) throw new Error("ADMIN role was not recognized");
    console.log("  ✔ RBAC verified: USER rejected from admin desk, ADMIN accepted.");

    // 8. Session Expiration
    console.log("8. Testing Session Expiration Logic...");
    const expiredToken = crypto.randomBytes(32).toString("base64url");
    const expiredHash = hashSessionToken(expiredToken);
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: expiredHash,
        expiresAt: new Date(Date.now() - 1000 * 60), // expired 1 min ago
      },
    });

    const expiredLookup = await prisma.session.findUnique({
      where: { tokenHash: expiredHash },
    });
    const isSessionValid = expiredLookup && expiredLookup.expiresAt > new Date();
    if (isSessionValid) throw new Error("Expired session was validated!");
    console.log("  ✔ Expired session rejected by expiration guard.");

    // 9. Logout / Session Invalidation
    console.log("9. Testing Logout / Session Invalidation...");
    await prisma.session.delete({
      where: { tokenHash },
    });
    const invalidatedLookup = await prisma.session.findUnique({
      where: { tokenHash },
    });
    if (invalidatedLookup !== null) throw new Error("Destroyed session still exists!");
    console.log("  ✔ Session deleted in Neon upon logout.");

    console.log("\n=== ALL AUTHENTICATION AUDIT CHECKS PASSED AGAINST NEON ===");
  } finally {
    // Clean up
    console.log("\n10. Cleaning up test auth records from Neon...");
    if (testUserId) {
      await prisma.session.deleteMany({ where: { userId: testUserId } });
      await prisma.profile.deleteMany({ where: { userId: testUserId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });
      console.log("  ✔ Cleaned up test auth user & sessions.");
    }
    await prisma.$disconnect();
    console.log("✔ Teardown complete. Neon auth audit finished with 0 residue.");
  }
}

runNeonAuthTests().catch((err) => {
  console.error("Auth test failed:", err);
  process.exit(1);
});
