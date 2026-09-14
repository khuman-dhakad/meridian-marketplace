import React, { Suspense } from "react";
import Link from "next/link";
import { searchListings, getCategories, getLocations } from "@/lib/data/repository";
import { ListingCard } from "@/components/listings/ListingCard";
import { SearchFilters } from "@/components/search/SearchFilters";
import { Pagination } from "@/components/ui/Pagination";
import { Search, MapPin, Tag, ArrowLeft, ShieldCheck } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    location?: string;
    condition?: string;
    sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
    verifiedOnly?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "all";
  const locationSlug = params.location || "all";
  const condition = params.condition && params.condition !== "all" ? params.condition : undefined;
  const sortBy = params.sortBy || "newest";
  const verifiedOnly = params.verifiedOnly === "true";
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [categories, locations, searchResult] = await Promise.all([
    getCategories(),
    getLocations(),
    searchListings({
      query,
      category: categorySlug,
      location: locationSlug,
      condition: condition as any,
      sortBy,
      verifiedOnly,
      minPrice,
      maxPrice,
      page,
      limit: 12,
    }),
  ]);

  const { listings, total, totalPages } = searchResult;

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const activeLocation = locations.find((l) => l.slug === locationSlug);

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Search Results</span>
          {query && (
            <>
              <span>/</span>
              <span className="text-brand-600 font-medium truncate max-w-xs">&quot;{query}&quot;</span>
            </>
          )}
        </div>

        {/* Results Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {query ? `Search Results for "${query}"` : "Classified Marketplace Directory"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Showing {total} listings</span>
              {activeCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium">
                  <Tag className="w-3 h-3" />
                  {activeCategory.name}
                </span>
              )}
              {activeLocation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  <MapPin className="w-3 h-3" />
                  {activeLocation.name}
                </span>
              )}
              {condition && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                  Condition: {condition.replace("_", " ")}
                </span>
              )}
              {verifiedOnly && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  Verified Sellers Only
                </span>
              )}
            </div>
          </div>

          <Link
            href="/post-ad"
            className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs sm:text-sm font-semibold hover:bg-brand-700 transition-colors shrink-0 text-center"
          >
            Post an Ad in this Category
          </Link>
        </div>

        {/* Main Content: Sidebar Filters + Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />}>
              <SearchFilters />
            </Suspense>
          </div>

          {/* Results Grid / Empty State */}
          <div className="lg:col-span-3">
            {listings.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map((item) => (
                    <ListingCard key={item.id} listing={item} />
                  ))}
                </div>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  basePath="/search"
                  queryParams={{
                    q: query || undefined,
                    category: categorySlug !== "all" ? categorySlug : undefined,
                    location: locationSlug !== "all" ? locationSlug : undefined,
                    condition,
                    sortBy: sortBy !== "newest" ? sortBy : undefined,
                    verifiedOnly: verifiedOnly ? "true" : undefined,
                    minPrice,
                    maxPrice,
                  }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-subtle">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No listings matched your criteria</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  Try broadening your search keyword, adjusting your price range, or clearing filters.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/search"
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Clear All Filters
                  </Link>
                  <Link
                    href="/post-ad"
                    className="px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
                  >
                    Post an Ad Now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
