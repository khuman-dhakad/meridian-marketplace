import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocationBySlug, getLocations, searchListings } from "@/lib/data/repository";
import { ListingCard } from "@/components/listings/ListingCard";
import { Pagination } from "@/components/ui/Pagination";
import { ArrowLeft, MapPin, Building2, PlusCircle } from "lucide-react";
import type { Metadata } from "next";

interface LocationPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
  }>;
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) {
    return { title: "Location Not Found" };
  }

  return {
    title: `${location.name} Classifieds & Local Listings | Meridian`,
    description: `Discover verified local classifieds and services in ${location.name} (${location.state}).`,
    openGraph: {
      title: `${location.name} | Meridian Marketplace`,
      description: `Verified local ads in ${location.name}. Trade safely in your neighborhood.`,
    },
  };
}

export async function generateStaticParams() {
  const locations = await getLocations();
  return locations.map((loc) => ({
    slug: loc.slug,
  }));
}

export default async function LocationPage({ params, searchParams }: LocationPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const page = Math.max(1, Number(sParams.page) || 1);
  const sortBy = sParams.sortBy || "newest";

  const location = await getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  const { listings, total, totalPages } = await searchListings({
    location: slug,
    page,
    limit: 12,
    sortBy,
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <span>/</span>
          <Link href="/#locations" className="hover:text-slate-900">
            Locations
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{location.name}</span>
        </div>

        {/* Location Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 mb-8 shadow-subtle">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Metropolitan Region &bull; {location.state}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {location.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Connect with verified local sellers, browse neighborhood listings, and trade safely in{" "}
                {location.name}.
              </p>
            </div>

            <Link
              href={`/post-ad?location=${location.slug}`}
              className="px-5 py-3 rounded-xl bg-brand-600 text-white text-xs sm:text-sm font-semibold hover:bg-brand-700 transition-colors inline-flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post an Ad in {location.name}</span>
            </Link>
          </div>

          {/* Subareas List */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              <Building2 className="w-4 h-4 text-brand-600" />
              <span>Popular Sub-Areas &amp; Neighborhoods ({location.subAreas.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {location.subAreas.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/search?location=${location.slug}&q=${encodeURIComponent(sub.name)}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-xs font-medium transition-colors"
                >
                  {sub.name} <span className="text-slate-400 font-normal">({sub.listingCount})</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Listings in this Location */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Active Classifieds in {location.name} ({total})
            </h2>
            <Link
              href={`/search?location=${location.slug}`}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Filter in Advanced Search &rarr;
            </Link>
          </div>

          {listings.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath={`/location/${location.slug}`}
                queryParams={{
                  sortBy: sortBy !== "newest" ? sortBy : undefined,
                }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-subtle">
              <p className="text-sm text-slate-500">
                Currently no active ads in this exact region.
              </p>
              <Link
                href="/post-ad"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post the First Ad</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
