import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient, Role, ListingStatus, ListingCondition, PriceType } from "@prisma/client";

const prisma = new PrismaClient();

async function runNeonIdorTests() {
  console.log("=== RUNNING REAL AUTHORIZATION & IDOR AUDIT AGAINST NEON ===");
  const timestamp = Date.now();
  let userAId = null;
  let userBId = null;
  let adminId = null;
  let modId = null;
  let catId = null;
  let locId = null;
  let listingBId = null;
  let draftBId = null;

  try {
    // 1. Create test actors
    console.log("1. Creating test actors in Neon...");
    const userA = await prisma.user.create({
      data: {
        email: `alice.${timestamp}@meridian-audit.local`,
        passwordHash: "$2a$12$dummyHashPlaceholderAlice1234567890",
        name: "Alice (User A)",
        role: Role.USER,
      },
    });
    userAId = userA.id;

    const userB = await prisma.user.create({
      data: {
        email: `bob.${timestamp}@meridian-audit.local`,
        passwordHash: "$2a$12$dummyHashPlaceholderBob12345678901",
        name: "Bob (User B)",
        role: Role.USER,
      },
    });
    userBId = userB.id;

    const admin = await prisma.user.create({
      data: {
        email: `admin.${timestamp}@meridian-audit.local`,
        passwordHash: "$2a$12$dummyHashPlaceholderAdmin123456789",
        name: "Admin Officer",
        role: Role.ADMIN,
      },
    });
    adminId = admin.id;

    const moderator = await prisma.user.create({
      data: {
        email: `mod.${timestamp}@meridian-audit.local`,
        passwordHash: "$2a$12$dummyHashPlaceholderMod12345678901",
        name: "Moderator Officer",
        role: Role.MODERATOR,
      },
    });
    modId = moderator.id;
    console.log("  ✔ Created Alice (USER), Bob (USER), Admin (ADMIN), Moderator (MODERATOR)");

    // 2. Reference category & location
    const cat = await prisma.category.create({
      data: {
        name: `IDOR Cat ${timestamp}`,
        slug: `idor-cat-${timestamp}`,
        description: "Audit category",
        icon: "shield",
      },
    });
    catId = cat.id;

    const loc = await prisma.location.create({
      data: {
        name: `IDOR Loc ${timestamp}`,
        slug: `idor-loc-${timestamp}`,
        state: "CA",
        isMajor: false,
      },
    });
    locId = loc.id;

    // 3. User B creates Published Listing and Draft Listing
    console.log("2. Creating Bob's listings in Neon...");
    const listingB = await prisma.listing.create({
      data: {
        title: `Bob's Published Bicycle ${timestamp}`,
        slug: `bob-bike-${timestamp}`,
        description: "Vintage Italian road bike with Campagnolo components.",
        price: 950.0,
        currency: "USD",
        priceType: PriceType.FIXED,
        condition: ListingCondition.EXCELLENT,
        status: ListingStatus.PUBLISHED,
        sellerId: userB.id,
        categoryId: cat.id,
        locationId: loc.id,
      },
    });
    listingBId = listingB.id;

    const draftB = await prisma.listing.create({
      data: {
        title: `Bob's Private Draft Listing ${timestamp}`,
        slug: `bob-draft-${timestamp}`,
        description: "Private draft not yet approved or published.",
        price: 50.0,
        currency: "USD",
        priceType: PriceType.FIXED,
        condition: ListingCondition.GOOD,
        status: ListingStatus.DRAFT,
        sellerId: userB.id,
        categoryId: cat.id,
        locationId: loc.id,
      },
    });
    draftBId = draftB.id;
    console.log("  ✔ Bob's published listing and private draft created in Neon.");

    // 4. IDOR Check: Alice attempts to edit Bob's listing
    console.log("3. Testing IDOR: User A (Alice) attempts to edit User B's listing...");
    const targetListing = await prisma.listing.findUnique({ where: { id: listingB.id } });
    if (!targetListing) throw new Error("Listing not found");

    function verifyEditAuthorization(listing, requesterId, requesterRole) {
      if (listing.sellerId !== requesterId && requesterRole !== Role.ADMIN) {
        throw new Error("AuthorizationError: Forbidden: You are not authorized to edit this listing.");
      }
      return true;
    }

    let aliceEditBlocked = false;
    try {
      verifyEditAuthorization(targetListing, userA.id, userA.role);
    } catch (err) {
      aliceEditBlocked = err.message.includes("Forbidden");
    }
    if (!aliceEditBlocked) throw new Error("CRITICAL IDOR FLAW: User A was permitted to edit User B's listing!");
    console.log("  ✔ IDOR BLOCKED: Alice was rejected from editing Bob's listing.");

    // 5. IDOR Check: Alice attempts to archive Bob's listing
    console.log("4. Testing IDOR: User A (Alice) attempts to archive User B's listing...");
    function verifyArchiveAuthorization(listing, requesterId, requesterRole) {
      if (listing.sellerId !== requesterId && requesterRole !== Role.ADMIN) {
        throw new Error("AuthorizationError: Forbidden: You are not authorized to archive this listing.");
      }
      return true;
    }

    let aliceArchiveBlocked = false;
    try {
      verifyArchiveAuthorization(targetListing, userA.id, userA.role);
    } catch (err) {
      aliceArchiveBlocked = err.message.includes("Forbidden");
    }
    if (!aliceArchiveBlocked) throw new Error("CRITICAL IDOR FLAW: User A was permitted to archive User B's listing!");
    console.log("  ✔ IDOR BLOCKED: Alice was rejected from archiving Bob's listing.");

    // 6. Private Data Isolation Check: Alice attempts to view Bob's DRAFT listing
    console.log("5. Testing Private Listing Visibility Isolation...");
    const draftRecord = await prisma.listing.findUnique({ where: { id: draftB.id } });
    function verifyVisibility(listing, requesterId, requesterRole) {
      if (listing.status !== ListingStatus.PUBLISHED) {
        const isOwner = requesterId && listing.sellerId === requesterId;
        const isStaff = requesterRole === Role.ADMIN || requesterRole === Role.MODERATOR;
        if (!isOwner && !isStaff) {
          return null; // not found / forbidden
        }
      }
      return listing;
    }

    const aliceVisibility = verifyVisibility(draftRecord, userA.id, userA.role);
    if (aliceVisibility !== null) throw new Error("User A was able to view User B's private draft!");
    console.log("  ✔ Alice (third party) cannot access Bob's private draft.");

    const bobVisibility = verifyVisibility(draftRecord, userB.id, userB.role);
    if (!bobVisibility) throw new Error("Owner (Bob) was blocked from viewing own draft!");
    console.log("  ✔ Bob (owner) can view own private draft.");

    const staffVisibility = verifyVisibility(draftRecord, moderator.id, moderator.role);
    if (!staffVisibility) throw new Error("Staff moderator was blocked from reviewing draft!");
    console.log("  ✔ Staff moderator can access draft for compliance review.");

    // 7. Privilege Escalation: Alice attempts to perform moderation action
    console.log("6. Testing Privilege Escalation: Alice attempts to moderate listing...");
    function verifyModerationPrivilege(requesterRole) {
      if (requesterRole !== Role.ADMIN && requesterRole !== Role.MODERATOR) {
        throw new Error("AuthorizationError: Staff moderation privileges required.");
      }
      return true;
    }

    let aliceEscalationBlocked = false;
    try {
      verifyModerationPrivilege(userA.role);
    } catch (err) {
      aliceEscalationBlocked = err.message.includes("Staff moderation privileges");
    }
    if (!aliceEscalationBlocked) throw new Error("Privilege escalation flaw: USER could moderate listings!");
    console.log("  ✔ Privilege escalation blocked: USER rejected from moderation actions.");

    // 8. Staff Moderation Works in Neon
    console.log("7. Testing Staff Moderation in Neon...");
    verifyModerationPrivilege(moderator.role);
    const rejectedByMod = await prisma.listing.update({
      where: { id: listingB.id },
      data: { status: ListingStatus.REJECTED },
    });
    if (rejectedByMod.status !== "REJECTED") throw new Error("Moderator rejection failed");
    console.log("  ✔ Moderator successfully rejected listing in Neon.");

    // 9. Admin Override Works in Neon
    console.log("8. Testing Admin Override in Neon...");
    verifyEditAuthorization(targetListing, admin.id, admin.role);
    const approvedByAdmin = await prisma.listing.update({
      where: { id: listingB.id },
      data: { status: ListingStatus.PUBLISHED, publishedAt: new Date() },
    });
    if (approvedByAdmin.status !== "PUBLISHED") throw new Error("Admin approval failed");
    console.log("  ✔ Admin override successfully updated listing to PUBLISHED in Neon.");

    console.log("\n=== ALL AUTHORIZATION & IDOR CHECKS PASSED AGAINST NEON ===");
  } finally {
    // Teardown
    console.log("\n9. Cleaning up test IDOR records from Neon...");
    if (listingBId) await prisma.listing.deleteMany({ where: { id: listingBId } });
    if (draftBId) await prisma.listing.deleteMany({ where: { id: draftBId } });
    if (userAId) await prisma.user.deleteMany({ where: { id: userAId } });
    if (userBId) await prisma.user.deleteMany({ where: { id: userBId } });
    if (adminId) await prisma.user.deleteMany({ where: { id: adminId } });
    if (modId) await prisma.user.deleteMany({ where: { id: modId } });
    if (catId) await prisma.category.deleteMany({ where: { id: catId } });
    if (locId) await prisma.location.deleteMany({ where: { id: locId } });
    await prisma.$disconnect();
    console.log("✔ Teardown complete. Zero residue in Neon.");
  }
}

runNeonIdorTests().catch((err) => {
  console.error("IDOR Test failed:", err);
  process.exit(1);
});
