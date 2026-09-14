import { CATEGORIES } from "./categories";
import { LOCATIONS } from "./locations";
import { LISTINGS } from "./listings";
import { Category, Listing, Location, SearchFilters } from "../types";

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return CATEGORIES.find((c) => c.slug === slug);
}

export async function getLocations(): Promise<Location[]> {
  return LOCATIONS;
}

export async function getLocationBySlug(slug: string): Promise<Location | undefined> {
  return LOCATIONS.find((l) => l.slug === slug);
}

export async function getFeaturedListings(limit: number = 8): Promise<Listing[]> {
  return LISTINGS.slice(0, limit);
}

export async function getListingBySlug(slug: string): Promise<Listing | undefined> {
  return LISTINGS.find((l) => l.slug === slug);
}

export async function searchListings(filters: SearchFilters = {}): Promise<{
  listings: Listing[];
  total: number;
}> {
  let results = [...LISTINGS];

  // Text search in title or description
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

  // Category filter
  if (filters.category && filters.category !== "all") {
    results = results.filter((item) => item.categorySlug === filters.category);
  }

  // Location filter
  if (filters.location && filters.location !== "all") {
    results = results.filter((item) => item.locationSlug === filters.location);
  }

  // Verified seller only
  if (filters.verifiedOnly) {
    results = results.filter((item) => item.seller.isVerified);
  }

  // Price filters
  if (typeof filters.minPrice === "number") {
    results = results.filter((item) => item.price >= (filters.minPrice ?? 0));
  }
  if (typeof filters.maxPrice === "number" && filters.maxPrice > 0) {
    results = results.filter((item) => item.price <= (filters.maxPrice ?? Infinity));
  }

  // Sorting
  if (filters.sortBy === "price_asc") {
    results.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === "price_desc") {
    results.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === "popular") {
    results.sort((a, b) => b.viewsCount - a.viewsCount);
  } else {
    // default: newest
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return {
    listings: results,
    total: results.length,
  };
}
