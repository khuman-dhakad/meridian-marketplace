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
  phone?: string;
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

export type ListingCondition =
  | "NEW_CONDITION"
  | "LIKE_NEW"
  | "EXCELLENT"
  | "GOOD"
  | "FAIR"
  | "FOR_PARTS";

export type ListingStatusType =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "EXPIRED"
  | "ARCHIVED";

export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  isNegotiable: boolean;
  priceType?: "fixed" | "hourly" | "monthly" | "free" | "contact";
  condition?: ListingCondition;
  status?: ListingStatusType;
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
  contactPhone?: string;
  isFavorited?: boolean;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  location?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchResults {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
