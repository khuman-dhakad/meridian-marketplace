import { prisma } from "../db/prisma";
import { Category, Listing, Location, SearchFilters, SearchResults } from "../types";
import { DEMO_CATEGORIES, DEMO_LOCATIONS, DEMO_LISTINGS } from "./demo-data";
import { CreateListingInput, EditListingInput } from "../validations/listing";
import {
  DatabaseUnavailableError,
  AuthorizationError,
  ValidationError,
} from "../errors";
import { Role, ListingStatus, PriceType, ListingCondition, ReportStatus } from "@prisma/client";
import { slugify } from "../utils";

// =====================================================================
// DOMAIN MAPPERS
// =====================================================================

function mapPrismaListingToDomain(item: any): Listing {
  const images = (item.images || []).map((img: { url: string; altText?: string }) => ({
    url: img.url,
    alt: img.altText || item.title,
  }));

  const isVip = (item.promotions || []).some(
    (p: { type: string; status: string }) => p.type === "VIP" && p.status === "ACTIVE"
  );
  const isFeatured = (item.promotions || []).some(
    (p: { type: string; status: string }) => p.type === "FEATURED" && p.status === "ACTIVE"
  );
  const isUrgent = (item.promotions || []).some(
    (p: { type: string; status: string }) => p.type === "URGENT" && p.status === "ACTIVE"
  );

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    price: Number(item.price),
    currency: item.currency,
    isNegotiable: Boolean(item.negotiable),
    priceType: (item.priceType ? item.priceType.toLowerCase() : "fixed") as
      | "fixed"
      | "hourly"
      | "monthly"
      | "free"
      | "contact",
    condition: (item.condition as any) || "GOOD",
    status: (item.status as any) || "PUBLISHED",
    categorySlug: item.category?.slug || "",
    categoryName: item.category?.name || "Uncategorized",
    locationSlug: item.location?.slug || "",
    locationName: item.location ? `${item.location.name}, ${item.location.state}` : "General",
    images: images.length > 0 ? images : [{ url: "", alt: item.title }],
    attributes: {},
    seller: {
      id: item.seller?.id || item.sellerId,
      name: item.seller?.profile?.displayName || item.seller?.name || "Verified Member",
      avatar: item.seller?.profile?.avatar || undefined,
      phone: item.seller?.profile?.phone || undefined,
      isVerified: item.seller?.profile?.isVerified || false,
      memberSince: item.seller?.createdAt
        ? new Date(item.seller.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "Recent Member",
      rating: item.seller?.profile?.rating ?? 5.0,
      reviewCount: item.seller?.profile?.reviewCount ?? 0,
      responseTime: item.seller?.profile?.responseTime ?? "< 1 hour",
    },
    badges: {
      isVip,
      isFeatured,
      isVerified: item.seller?.profile?.isVerified || false,
      isUrgent,
    },
    createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
    viewsCount: item.viewsCount || 0,
    contactPhone: item.seller?.profile?.phone || undefined,
  };
}

// =====================================================================
// AUTHENTICATED USER & ACCOUNT DATABASE OPERATIONS (FAIL CLOSED)
// =====================================================================

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  } catch (err) {
    console.error("[Repository] Database error in getUserById:", err);
    throw new DatabaseUnavailableError();
  }
}

export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { profile: true },
    });
  } catch (err) {
    console.error("[Repository] Database error in getUserByEmail:", err);
    throw new DatabaseUnavailableError();
  }
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  role?: Role;
  businessName?: string;
}) {
  try {
    return await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        name: data.name.trim(),
        role: data.role || Role.USER,
        profile: {
          create: {
            displayName: data.name.trim(),
            businessName: data.businessName?.trim() || null,
          },
        },
      },
      include: { profile: true },
    });
  } catch (err) {
    console.error("[Repository] Database error in createUser:", err);
    throw new DatabaseUnavailableError();
  }
}

// =====================================================================
// AUTHENTICATED LISTING MUTATIONS (FAIL CLOSED)
// =====================================================================

/**
 * Creates a real database listing associated with the authenticated user.
 * FAILS CLOSED: Never silently substitutes fake data if PostgreSQL is unreachable.
 */
export async function createListing(
  input: CreateListingInput,
  sellerId: string
): Promise<Listing> {
  try {
    // 1. Resolve Category & Location by slug
    const category = await prisma.category.findUnique({
      where: { slug: input.categorySlug },
    });
    if (!category) {
      throw new ValidationError(`Category '${input.categorySlug}' not found.`);
    }

    const location = await prisma.location.findUnique({
      where: { slug: input.locationSlug },
    });
    if (!location) {
      throw new ValidationError(`Location '${input.locationSlug}' not found.`);
    }

    // 2. Generate slug with unique suffix
    const baseSlug = slugify(input.title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    // 3. Map PriceType and Condition enum
    const priceTypeMap: Record<string, PriceType> = {
      fixed: PriceType.FIXED,
      hourly: PriceType.HOURLY,
      monthly: PriceType.MONTHLY,
      free: PriceType.FREE,
      contact: PriceType.CONTACT,
    };

    const conditionMap: Record<string, ListingCondition> = {
      NEW_CONDITION: ListingCondition.NEW_CONDITION,
      LIKE_NEW: ListingCondition.LIKE_NEW,
      EXCELLENT: ListingCondition.EXCELLENT,
      GOOD: ListingCondition.GOOD,
      FAIR: ListingCondition.FAIR,
      FOR_PARTS: ListingCondition.FOR_PARTS,
    };

    const condition = conditionMap[input.condition] || ListingCondition.GOOD;

    // 4. Create in PostgreSQL with images
    const created = await prisma.listing.create({
      data: {
        title: input.title,
        slug: uniqueSlug,
        description: input.description,
        price: input.price,
        currency: input.currency || "USD",
        negotiable: Boolean(input.isNegotiable),
        priceType: priceTypeMap[input.priceType] || PriceType.FIXED,
        condition,
        status: ListingStatus.PUBLISHED,
        sellerId,
        categoryId: category.id,
        locationId: location.id,
        images: {
          create: (input.images || []).map((url, idx) => ({
            url,
            altText: `${input.title} - Photo ${idx + 1}`,
            sortOrder: idx,
          })),
        },
      },
      include: {
        category: true,
        location: true,
        seller: { include: { profile: true } },
        images: { orderBy: { sortOrder: "asc" } },
        promotions: true,
      },
    });

    return mapPrismaListingToDomain(created);
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    console.error("[Repository] Database error in createListing:", err);
    throw new DatabaseUnavailableError(
      "Unable to save listing at this time. Database service is unavailable."
    );
  }
}

/**
 * Server-side verified listing update. Enforces ownership authorization.
 * FAILS CLOSED: Never performs mutations if PostgreSQL is unreachable.
 */
export async function updateListing(
  listingId: string,
  input: EditListingInput,
  userId: string,
  userRole: Role
): Promise<Listing> {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { images: true },
    });

    if (!listing) {
      throw new ValidationError("Listing not found.");
    }

    // Server-side ownership check: seller or ADMIN
    if (listing.sellerId !== userId && userRole !== Role.ADMIN) {
      throw new AuthorizationError("You are not authorized to edit this listing.");
    }

    // Resolve category & location
    const category = await prisma.category.findUnique({
      where: { slug: input.categorySlug },
    });
    if (!category) throw new ValidationError(`Category '${input.categorySlug}' not found.`);

    const location = await prisma.location.findUnique({
      where: { slug: input.locationSlug },
    });
    if (!location) throw new ValidationError(`Location '${input.locationSlug}' not found.`);

    const priceTypeMap: Record<string, PriceType> = {
      fixed: PriceType.FIXED,
      hourly: PriceType.HOURLY,
      monthly: PriceType.MONTHLY,
      free: PriceType.FREE,
      contact: PriceType.CONTACT,
    };

    const conditionMap: Record<string, ListingCondition> = {
      NEW_CONDITION: ListingCondition.NEW_CONDITION,
      LIKE_NEW: ListingCondition.LIKE_NEW,
      EXCELLENT: ListingCondition.EXCELLENT,
      GOOD: ListingCondition.GOOD,
      FAIR: ListingCondition.FAIR,
      FOR_PARTS: ListingCondition.FOR_PARTS,
    };

    // Update images if provided
    if (input.images) {
      await prisma.listingImage.deleteMany({ where: { listingId } });
      if (input.images.length > 0) {
        await prisma.listingImage.createMany({
          data: input.images.map((url, idx) => ({
            listingId,
            url,
            altText: `${input.title} - Photo ${idx + 1}`,
            sortOrder: idx,
          })),
        });
      }
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        title: input.title,
        description: input.description,
        price: input.price,
        currency: input.currency || "USD",
        negotiable: Boolean(input.isNegotiable),
        priceType: priceTypeMap[input.priceType] || PriceType.FIXED,
        condition: conditionMap[input.condition] || listing.condition,
        categoryId: category.id,
        locationId: location.id,
      },
      include: {
        category: true,
        location: true,
        seller: { include: { profile: true } },
        images: { orderBy: { sortOrder: "asc" } },
        promotions: true,
      },
    });

    return mapPrismaListingToDomain(updated);
  } catch (err) {
    if (err instanceof AuthorizationError || err instanceof ValidationError) throw err;
    console.error("[Repository] Database error in updateListing:", err);
    throw new DatabaseUnavailableError("Unable to update listing. Database service is unavailable.");
  }
}

/**
 * Server-side verified listing archive (soft deletion). Enforces ownership.
 */
export async function archiveListing(
  listingId: string,
  userId: string,
  userRole: Role
): Promise<void> {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new ValidationError("Listing not found.");
    }

    if (listing.sellerId !== userId && userRole !== Role.ADMIN) {
      throw new AuthorizationError("You are not authorized to archive this listing.");
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.ARCHIVED },
    });
  } catch (err) {
    if (err instanceof AuthorizationError || err instanceof ValidationError) throw err;
    console.error("[Repository] Database error in archiveListing:", err);
    throw new DatabaseUnavailableError("Unable to archive listing. Database service is unavailable.");
  }
}

/**
 * Retrieves a listing by ID, enforcing private listing view authorization.
 */
export async function getListingById(
  listingId: string,
  requesterUserId?: string,
  requesterRole?: Role
): Promise<Listing | undefined> {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        category: true,
        location: true,
        seller: { include: { profile: true } },
        images: { orderBy: { sortOrder: "asc" } },
        promotions: true,
      },
    });

    if (!listing) return undefined;

    // Visibility check: non-published listings only visible to owner or staff
    if (listing.status !== ListingStatus.PUBLISHED) {
      const isOwner = requesterUserId && listing.sellerId === requesterUserId;
      const isStaff = requesterRole === Role.ADMIN || requesterRole === Role.MODERATOR;
      if (!isOwner && !isStaff) {
        return undefined;
      }
    }

    const domain = mapPrismaListingToDomain(listing);
    if (requesterUserId) {
      const fav = await prisma.favorite.findUnique({
        where: { userId_listingId: { userId: requesterUserId, listingId: listing.id } },
      });
      domain.isFavorited = Boolean(fav);
    }
    return domain;
  } catch {
    const demo = DEMO_LISTINGS.find((l) => l.id === listingId);
    return demo;
  }
}

/**
 * Server-side verified listing deletion. Enforces ownership authorization.
 */
export async function deleteListing(
  listingId: string,
  userId: string,
  userRole: Role
): Promise<void> {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new ValidationError("Listing not found.");
    }

    // Server-side ownership check
    if (listing.sellerId !== userId && userRole !== Role.ADMIN) {
      throw new AuthorizationError("You are not authorized to delete this listing.");
    }

    await prisma.listing.delete({
      where: { id: listingId },
    });
  } catch (err) {
    if (err instanceof AuthorizationError || err instanceof ValidationError) throw err;
    console.error("[Repository] Database error in deleteListing:", err);
    throw new DatabaseUnavailableError("Unable to delete listing. Database service is unavailable.");
  }
}

/**
 * Server-side verified listing moderation. Enforces MODERATOR or ADMIN role authorization.
 * FAILS CLOSED: Never performs mutations if PostgreSQL is unreachable.
 */
export async function moderateListing(
  listingId: string,
  decision: "APPROVE" | "REJECT",
  userRole: Role
): Promise<Listing> {
  // 1. Role verification
  if (userRole !== Role.ADMIN && userRole !== Role.MODERATOR) {
    throw new AuthorizationError("Staff moderation privileges (ADMIN or MODERATOR) required.");
  }

  try {
    // 2. Retrieve target record from database post-retrieval
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        category: true,
        location: true,
        seller: { include: { profile: true } },
        images: true,
        promotions: true,
      },
    });

    if (!listing) {
      throw new ValidationError("Listing not found.");
    }

    // 3. Determine target status
    const newStatus =
      decision === "APPROVE" ? ListingStatus.PUBLISHED : ListingStatus.REJECTED;

    // 4. Update status in database
    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: newStatus,
        publishedAt: decision === "APPROVE" ? new Date() : listing.publishedAt,
      },
      include: {
        category: true,
        location: true,
        seller: { include: { profile: true } },
        images: true,
        promotions: true,
      },
    });

    return mapPrismaListingToDomain(updated);
  } catch (err) {
    if (err instanceof AuthorizationError || err instanceof ValidationError) throw err;
    console.error("[Repository] Database error in moderateListing:", err);
    throw new DatabaseUnavailableError(
      "Unable to update listing moderation status. Database service is unavailable."
    );
  }
}

/**
 * Queries listings owned by an authenticated user.
 * FAILS CLOSED: Never serves fake listings for authenticated dashboards.
 */
export async function getUserListings(userId: string): Promise<Listing[]> {
  try {
    const listings = await prisma.listing.findMany({
      where: { sellerId: userId },
      include: {
        category: true,
        location: true,
        seller: { include: { profile: true } },
        images: true,
        promotions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return listings.map(mapPrismaListingToDomain);
  } catch (err) {
    console.error("[Repository] Database error in getUserListings:", err);
    throw new DatabaseUnavailableError(
      "Unable to retrieve your dashboard listings at this time."
    );
  }
}

// =====================================================================
// PUBLIC READ OPERATIONS (CATEGORIES, LOCATIONS, PUBLIC SEARCH)
// Attempts live PostgreSQL first. Uses explicit demo fallback for local preview.
// =====================================================================

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: { where: { isActive: true }, orderBy: { order: "asc" } },
        _count: { select: { listings: true } },
      },
      orderBy: { order: "asc" },
    });

    if (categories && categories.length > 0) {
      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        description: c.description,
        listingCount: c._count.listings,
        featured: true,
        subcategories: c.children.map((sub) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          count: 0,
        })),
      }));
    }
  } catch {
    // Database unconfigured or unreachable -> Fallback to explicit demo data for public preview
  }

  return DEMO_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  try {
    const c = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: { where: { isActive: true } },
        _count: { select: { listings: true } },
      },
    });

    if (c) {
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        description: c.description,
        listingCount: c._count.listings,
        featured: true,
        subcategories: c.children.map((sub) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          count: 0,
        })),
      };
    }
  } catch {
    // Fallback to explicit demo data for public preview
  }

  return DEMO_CATEGORIES.find((c) => c.slug === slug);
}

export async function getLocations(): Promise<Location[]> {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: { where: { isActive: true } },
        _count: { select: { listings: true } },
      },
    });

    if (locations && locations.length > 0) {
      return locations.map((l) => ({
        id: l.id,
        name: l.name,
        slug: l.slug,
        state: l.state,
        listingCount: l._count.listings,
        isMajor: l.isMajor,
        subAreas: l.children.map((sub) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          listingCount: 0,
        })),
      }));
    }
  } catch {
    // Fallback to explicit demo data for public preview
  }

  return DEMO_LOCATIONS;
}

export async function getLocationBySlug(slug: string): Promise<Location | undefined> {
  try {
    const l = await prisma.location.findUnique({
      where: { slug },
      include: {
        children: { where: { isActive: true } },
        _count: { select: { listings: true } },
      },
    });

    if (l) {
      return {
        id: l.id,
        name: l.name,
        slug: l.slug,
        state: l.state,
        listingCount: l._count.listings,
        isMajor: l.isMajor,
        subAreas: l.children.map((sub) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          listingCount: 0,
        })),
      };
    }
  } catch {
    // Fallback to explicit demo data for public preview
  }

  return DEMO_LOCATIONS.find((l) => l.slug === slug);
}

export async function getFeaturedListings(limit = 8): Promise<Listing[]> {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: ListingStatus.PUBLISHED },
      include: {
        category: true,
        location: true,
        seller: { include: { profile: true } },
        images: true,
        promotions: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    if (listings && listings.length > 0) {
      return listings.map(mapPrismaListingToDomain);
    }
  } catch {
    // Fallback to explicit demo data for public preview
  }

  return DEMO_LISTINGS.slice(0, limit);
}

export async function getListingBySlug(
  slug: string,
  requesterUserId?: string,
  requesterRole?: Role
): Promise<Listing | undefined> {
  try {
    const listing = await prisma.listing.findUnique({
      where: { slug },
      include: {
        category: true,
        location: true,
        seller: { include: { profile: true } },
        images: { orderBy: { sortOrder: "asc" } },
        promotions: true,
      },
    });

    if (listing) {
      // Visibility guard: non-published listings only visible to owner or staff
      if (listing.status !== ListingStatus.PUBLISHED) {
        const isOwner = requesterUserId && listing.sellerId === requesterUserId;
        const isStaff = requesterRole === Role.ADMIN || requesterRole === Role.MODERATOR;
        if (!isOwner && !isStaff) {
          return undefined;
        }
      }

      // Increment views count non-destructively for published listings
      if (listing.status === ListingStatus.PUBLISHED) {
        try {
          await prisma.listing.update({
            where: { id: listing.id },
            data: { viewsCount: { increment: 1 } },
          });
        } catch {
          // ignore view increment failures
        }
      }

      const domain = mapPrismaListingToDomain(listing);
      if (requesterUserId) {
        try {
          const fav = await prisma.favorite.findUnique({
            where: { userId_listingId: { userId: requesterUserId, listingId: listing.id } },
          });
          domain.isFavorited = Boolean(fav);
        } catch {
          domain.isFavorited = false;
        }
      }
      return domain;
    }
  } catch {
    // Fallback to explicit demo data for public preview
  }

  return DEMO_LISTINGS.find((l) => l.slug === slug);
}

export async function searchListings(filters: SearchFilters = {}): Promise<SearchResults> {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(50, filters.limit || 12));
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      status: ListingStatus.PUBLISHED,
    };

    if (filters.query && filters.query.trim()) {
      where.OR = [
        { title: { contains: filters.query.trim(), mode: "insensitive" } },
        { description: { contains: filters.query.trim(), mode: "insensitive" } },
      ];
    }

    if (filters.category && filters.category !== "all") {
      where.category = { slug: filters.category };
    }

    if (filters.location && filters.location !== "all") {
      where.location = { slug: filters.location };
    }

    if (filters.condition) {
      const conditionMap: Record<string, ListingCondition> = {
        NEW_CONDITION: ListingCondition.NEW_CONDITION,
        LIKE_NEW: ListingCondition.LIKE_NEW,
        EXCELLENT: ListingCondition.EXCELLENT,
        GOOD: ListingCondition.GOOD,
        FAIR: ListingCondition.FAIR,
        FOR_PARTS: ListingCondition.FOR_PARTS,
      };
      if (conditionMap[filters.condition]) {
        where.condition = conditionMap[filters.condition];
      }
    }

    if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
      where.price = {};
      if (typeof filters.minPrice === "number") where.price.gte = filters.minPrice;
      if (typeof filters.maxPrice === "number" && filters.maxPrice > 0) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.verifiedOnly) {
      where.seller = { profile: { isVerified: true } };
    }

    let orderBy: any = { createdAt: "desc" };
    if (filters.sortBy === "price_asc") orderBy = { price: "asc" };
    if (filters.sortBy === "price_desc") orderBy = { price: "desc" };
    if (filters.sortBy === "popular") orderBy = { viewsCount: "desc" };

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          category: true,
          location: true,
          seller: { include: { profile: true } },
          images: { orderBy: { sortOrder: "asc" } },
          promotions: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    if (items && items.length > 0) {
      return {
        listings: items.map(mapPrismaListingToDomain),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  } catch {
    // Fallback to explicit demo data for public preview
  }

  // Explicit demo data filtering for local preview
  let results = [...DEMO_LISTINGS];

  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.locationName.toLowerCase().includes(q)
    );
  }

  if (filters.category && filters.category !== "all") {
    results = results.filter((item) => item.categorySlug === filters.category);
  }

  if (filters.location && filters.location !== "all") {
    results = results.filter((item) => item.locationSlug === filters.location);
  }

  if (filters.condition) {
    results = results.filter((item) => item.condition === filters.condition);
  }

  if (filters.verifiedOnly) {
    results = results.filter((item) => item.seller.isVerified);
  }

  if (typeof filters.minPrice === "number") {
    results = results.filter((item) => item.price >= (filters.minPrice ?? 0));
  }
  if (typeof filters.maxPrice === "number" && filters.maxPrice > 0) {
    results = results.filter((item) => item.price <= (filters.maxPrice ?? Infinity));
  }

  if (filters.sortBy === "price_asc") {
    results.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === "price_desc") {
    results.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === "popular") {
    results.sort((a, b) => b.viewsCount - a.viewsCount);
  } else {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const total = results.length;
  const pagedListings = results.slice(skip, skip + limit);

  return {
    listings: pagedListings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

// =====================================================================
// FAVORITES OPERATIONS
// =====================================================================

export async function toggleFavorite(
  userId: string,
  listingId: string
): Promise<{ isFavorited: boolean }> {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new ValidationError("Listing not found.");

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { isFavorited: false };
    } else {
      await prisma.favorite.create({
        data: { userId, listingId },
      });
      return { isFavorited: true };
    }
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    console.error("[Repository] Database error in toggleFavorite:", err);
    throw new DatabaseUnavailableError("Unable to update favorite. Database service is unavailable.");
  }
}

export async function getUserFavorites(userId: string): Promise<Listing[]> {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            category: true,
            location: true,
            seller: { include: { profile: true } },
            images: { orderBy: { sortOrder: "asc" } },
            promotions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return favorites
      .filter((f) => f.listing && f.listing.status === ListingStatus.PUBLISHED)
      .map((f) => {
        const item = mapPrismaListingToDomain(f.listing);
        item.isFavorited = true;
        return item;
      });
  } catch (err) {
    console.error("[Repository] Database error in getUserFavorites:", err);
    throw new DatabaseUnavailableError("Unable to retrieve saved favorites at this time.");
  }
}

export async function isListingFavorited(
  userId: string,
  listingId: string
): Promise<boolean> {
  try {
    const fav = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    return Boolean(fav);
  } catch {
    return false;
  }
}

// =====================================================================
// COMMUNICATION & REPORTING OPERATIONS
// =====================================================================

export async function contactSeller(
  senderId: string,
  listingId: string,
  messageText: string
): Promise<{ conversationId: string; messageId: string }> {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new ValidationError("Listing not found.");
    }

    if (listing.sellerId === senderId) {
      throw new ValidationError("You cannot send a message to yourself regarding your own listing.");
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        listingId,
        buyerId: senderId,
        sellerId: listing.sellerId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          listingId,
          buyerId: senderId,
          sellerId: listing.sellerId,
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        body: messageText,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return { conversationId: conversation.id, messageId: message.id };
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    console.error("[Repository] Database error in contactSeller:", err);
    throw new DatabaseUnavailableError("Unable to deliver message. Database service is unavailable.");
  }
}

export async function reportListing(
  reporterUserId: string,
  listingId: string,
  reason: string,
  description?: string
): Promise<{ reportId: string }> {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new ValidationError("Listing not found.");
    }

    const existing = await prisma.report.findFirst({
      where: {
        reporterId: reporterUserId,
        listingId,
        status: ReportStatus.PENDING,
      },
    });

    if (existing) {
      return { reportId: existing.id };
    }

    const report = await prisma.report.create({
      data: {
        reporterId: reporterUserId,
        listingId,
        reportedUserId: listing.sellerId,
        reason,
        description: description || "No additional details provided.",
        status: ReportStatus.PENDING,
      },
    });

    return { reportId: report.id };
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    console.error("[Repository] Database error in reportListing:", err);
    throw new DatabaseUnavailableError("Unable to submit report. Database service is unavailable.");
  }
}
