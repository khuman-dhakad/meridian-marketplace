export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  listingCount: number;
  featured: boolean;
  subcategories: Subcategory[];
}

export interface SubArea {
  id: string;
  name: string;
  slug: string;
  listingCount: number;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  state: string;
  listingCount: number;
  isMajor: boolean;
  subAreas: SubArea[];
}

export interface Seller {
  id: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  memberSince: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
}

export interface ListingBadges {
  isVip?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  isUrgent?: boolean;
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  isNegotiable: boolean;
  priceType?: "fixed" | "hourly" | "monthly" | "free" | "contact";
  categorySlug: string;
  categoryName: string;
  locationSlug: string;
  locationName: string;
  images: {
    url: string;
    alt: string;
  }[];
  attributes: Record<string, string>;
  seller: Seller;
  badges: ListingBadges;
  createdAt: string;
  viewsCount: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
}
