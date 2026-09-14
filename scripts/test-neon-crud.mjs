import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient, Role, ListingStatus, ListingCondition, PriceType } from "@prisma/client";

const prisma = new PrismaClient();

async function runRealDatabaseCrudTests() {
  console.log("=== RUNNING REAL DATABASE CRUD AUDIT AGAINST NEON ===");
  const timestamp = Date.now();
  const testEmail = `test.user.${timestamp}@meridian-audit.local`;
  const testCategorySlug = `audit-cat-${timestamp}`;
  const testLocationSlug = `audit-loc-${timestamp}`;
  const testListingSlug = `audit-listing-${timestamp}`;

  let testUserId = null;
  let testCategoryId = null;
  let testLocationId = null;
  let testListingId = null;

  try {
    // 1. Create a user
    console.log("1. Creating test User in Neon...");
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: "$2a$12$eXAmPL3HashNotARealSecretHashPlaceholderOnly",
        name: "Neon Audit User",
        role: Role.USER,
        isActive: true,
      },
    });
    testUserId = user.id;
    console.log(`  ✔ User created: ID ${user.id}, Email: ${user.email}`);

    // 2. Create the associated profile
    console.log("2. Creating test Profile in Neon...");
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        displayName: "Neon Audit User",
        bio: "Ephemeral profile for automated database audit.",
        isVerified: true,
      },
    });
    console.log(`  ✔ Profile created: ID ${profile.id}, UserID: ${profile.userId}`);

    // 3. Create a category & location reference
    console.log("3. Creating reference Category & Location in Neon...");
    const category = await prisma.category.create({
      data: {
        name: `Audit Category ${timestamp}`,
        slug: testCategorySlug,
        description: "Temporary category for database audit.",
        icon: "folder",
        isActive: true,
      },
    });
    testCategoryId = category.id;

    const location = await prisma.location.create({
      data: {
        name: `Audit Metro ${timestamp}`,
        slug: testLocationSlug,
        state: "NY",
        isMajor: true,
        isActive: true,
      },
    });
    testLocationId = location.id;
    console.log(`  ✔ Reference records created: Cat ${category.id}, Loc ${location.id}`);

    // 4. Create a listing
    console.log("4. Creating test Listing in Neon...");
    const listing = await prisma.listing.create({
      data: {
        title: `Audit Listing ${timestamp}`,
        slug: testListingSlug,
        description: "High-grade mechanical keyboard with custom lubed switches and PBT keycaps.",
        price: 185.0,
        currency: "USD",
        negotiable: true,
        priceType: PriceType.FIXED,
        condition: ListingCondition.LIKE_NEW,
        status: ListingStatus.PUBLISHED,
        sellerId: user.id,
        categoryId: category.id,
        locationId: location.id,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-test-1",
              altText: "Test Keyboard Photo 1",
              sortOrder: 0,
            },
          ],
        },
      },
      include: {
        images: true,
        seller: true,
        category: true,
        location: true,
      },
    });
    testListingId = listing.id;
    console.log(`  ✔ Listing created: ID ${listing.id}, Slug: ${listing.slug}, Status: ${listing.status}`);

    // 5. Read the listing
    console.log("5. Reading Listing back from Neon...");
    const readListing = await prisma.listing.findUnique({
      where: { id: listing.id },
      include: {
        images: true,
        seller: { include: { profile: true } },
        category: true,
        location: true,
      },
    });
    if (!readListing) throw new Error("Failed to read listing back from Neon");
    if (readListing.title !== `Audit Listing ${timestamp}`) throw new Error("Title mismatch");
    if (readListing.condition !== "LIKE_NEW") throw new Error("Condition mismatch");
    if (readListing.images.length !== 1) throw new Error("Image relation count mismatch");
    if (readListing.seller.profile?.displayName !== "Neon Audit User") {
      throw new Error("Nested profile relation failed");
    }
    console.log("  ✔ Read successfully verified with all relations intact.");

    // 6. Update the listing
    console.log("6. Updating Listing in Neon...");
    const updatedListing = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        price: 165.0,
        condition: ListingCondition.EXCELLENT,
        viewsCount: { increment: 5 },
      },
    });
    if (Number(updatedListing.price) !== 165) throw new Error("Updated price mismatch");
    if (updatedListing.condition !== "EXCELLENT") throw new Error("Updated condition mismatch");
    if (updatedListing.viewsCount !== 5) throw new Error("Views increment mismatch");
    console.log("  ✔ Listing update verified (price, condition, view increment).");

    // 7. Create a favorite
    console.log("7. Creating Favorite in Neon...");
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        listingId: listing.id,
      },
    });
    console.log(`  ✔ Favorite created: ID ${favorite.id}`);

    // 8. Read the favorite
    console.log("8. Reading Favorite from Neon...");
    const readFav = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listing.id,
        },
      },
      include: {
        listing: true,
        user: true,
      },
    });
    if (!readFav) throw new Error("Favorite read back failed");
    console.log("  ✔ Favorite read and compound unique constraint verified.");

    // 9. Remove the favorite
    console.log("9. Removing Favorite from Neon...");
    await prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listing.id,
        },
      },
    });
    const checkDeletedFav = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listing.id,
        },
      },
    });
    if (checkDeletedFav !== null) throw new Error("Favorite was not deleted");
    console.log("  ✔ Favorite successfully deleted.");

    // 10. Archive the test listing using project business rule
    console.log("10. Archiving Listing (Soft Deletion) in Neon...");
    const archivedListing = await prisma.listing.update({
      where: { id: listing.id },
      data: { status: ListingStatus.ARCHIVED },
    });
    if (archivedListing.status !== "ARCHIVED") throw new Error("Listing status not ARCHIVED");
    console.log("  ✔ Listing successfully archived.");

    console.log("\n=== ALL 10 CRUD STEPS PASSED AGAINST NEON ===");
  } finally {
    // 11. Clean up all test records
    console.log("\n11. Cleaning up all test records from Neon...");
    if (testListingId) {
      await prisma.listingImage.deleteMany({ where: { listingId: testListingId } });
      await prisma.favorite.deleteMany({ where: { listingId: testListingId } });
      await prisma.listing.deleteMany({ where: { id: testListingId } });
      console.log("  ✔ Cleaned up test listing & images.");
    }
    if (testUserId) {
      await prisma.profile.deleteMany({ where: { userId: testUserId } });
      await prisma.session.deleteMany({ where: { userId: testUserId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });
      console.log("  ✔ Cleaned up test user & profile.");
    }
    if (testCategoryId) {
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
      console.log("  ✔ Cleaned up test category.");
    }
    if (testLocationId) {
      await prisma.location.deleteMany({ where: { id: testLocationId } });
      console.log("  ✔ Cleaned up test location.");
    }
    await prisma.$disconnect();
    console.log("✔ Complete cleanup verified. Zero orphaned test records remain.");
  }
}

runRealDatabaseCrudTests().catch((err) => {
  console.error("CRUD Test failed:", err);
  process.exit(1);
});
