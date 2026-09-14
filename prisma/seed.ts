/**
 * =====================================================================
 * MERIDIAN MARKETPLACE — DATABASE SEED SCRIPT
 * =====================================================================
 * For development & staging environment initialization only.
 * ALL credentials here are strictly fictional and development-only.
 * NEVER use these credentials in production.
 * =====================================================================
 */

import { PrismaClient, Role, PriceType, ListingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES } from "../src/lib/data/categories";
import { LOCATIONS } from "../src/lib/data/locations";
import { LISTINGS } from "../src/lib/data/listings";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Meridian database seed...");

  // 1. Seed Categories & Subcategories
  console.log("Seeding categories...");
  for (const cat of CATEGORIES) {
    const parentCategory = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        isActive: true,
      },
    });

    for (let i = 0; i < cat.subcategories.length; i++) {
      const sub = cat.subcategories[i];
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          parentId: parentCategory.id,
          order: i,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          description: `${sub.name} in ${cat.name}`,
          icon: cat.icon,
          parentId: parentCategory.id,
          order: i,
          isActive: true,
        },
      });
    }
  }

  // 2. Seed Locations & Sub-areas
  console.log("Seeding metropolitan locations...");
  for (const loc of LOCATIONS) {
    const parentLocation = await prisma.location.upsert({
      where: { slug: loc.slug },
      update: {
        name: loc.name,
        state: loc.state,
        isMajor: loc.isMajor,
      },
      create: {
        name: loc.name,
        slug: loc.slug,
        state: loc.state,
        isMajor: loc.isMajor,
        isActive: true,
      },
    });

    for (const sub of loc.subAreas) {
      await prisma.location.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          state: loc.state,
          parentId: parentLocation.id,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          state: loc.state,
          parentId: parentLocation.id,
          isActive: true,
        },
      });
    }
  }

  // 3. Seed Development Demo Users with Bcrypt Hashed Passwords
  console.log("Seeding development demo accounts...");
  const devPasswordHash = await bcrypt.hash("Password123!", 12);
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo.user@meridian.local" },
    update: {},
    create: {
      email: "demo.user@meridian.local",
      name: "Marcus Vance",
      passwordHash: devPasswordHash,
      role: Role.USER,
      emailVerified: new Date(),
      profile: {
        create: {
          displayName: "Marcus Vance",
          bio: "Automotive and technology enthusiast. Local community trader.",
          isVerified: true,
          rating: 4.95,
          reviewCount: 38,
          responseTime: "< 15 mins",
        },
      },
    },
  });

  const demoBusiness = await prisma.user.upsert({
    where: { email: "demo.dealer@meridian.local" },
    update: {},
    create: {
      email: "demo.dealer@meridian.local",
      name: "Apex Design & Engineering",
      passwordHash: devPasswordHash,
      role: Role.BUSINESS,
      emailVerified: new Date(),
      profile: {
        create: {
          displayName: "Apex Design & Engineering",
          businessName: "Apex Design & Engineering LLC",
          bio: "Licensed commercial architectural drafting, plan checks, and 3D modeling.",
          isVerified: true,
          rating: 4.98,
          reviewCount: 76,
          responseTime: "< 2 hours",
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@meridian.local" },
    update: {},
    create: {
      email: "admin@meridian.local",
      name: "Meridian Trust & Safety Desk",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
      profile: {
        create: {
          displayName: "Staff Moderator",
          bio: "Platform compliance, safety verification, and listing moderation.",
          isVerified: true,
        },
      },
    },
  });

  // 4. Seed Verified Marketplace Listings
  console.log("Seeding marketplace listings...");
  for (const item of LISTINGS) {
    const category = await prisma.category.findUnique({
      where: { slug: item.categorySlug },
    });
    const location = await prisma.location.findUnique({
      where: { slug: item.locationSlug },
    });

    if (!category || !location) continue;

    const sellerId =
      item.categorySlug === "professional-services"
        ? demoBusiness.id
        : demoUser.id;

    const priceTypeMap: Record<string, PriceType> = {
      fixed: PriceType.FIXED,
      hourly: PriceType.HOURLY,
      monthly: PriceType.MONTHLY,
      free: PriceType.FREE,
      contact: PriceType.CONTACT,
    };

    await prisma.listing.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        price: item.price,
        viewsCount: item.viewsCount,
      },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        price: item.price,
        currency: item.currency,
        negotiable: item.isNegotiable,
        priceType: priceTypeMap[item.priceType || "fixed"] || PriceType.FIXED,
        status: ListingStatus.PUBLISHED,
        sellerId,
        categoryId: category.id,
        locationId: location.id,
        viewsCount: item.viewsCount,
        images: {
          create: (item.images || []).map((img, idx) => ({
            url: img.url,
            altText: img.alt,
            sortOrder: idx,
          })),
        },
      },
    });
  }

  console.log("✅ Meridian database seed script completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
