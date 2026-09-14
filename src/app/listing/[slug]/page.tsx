import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  Eye,
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  Tag,
  Check,
} from "lucide-react";
import { getListingBySlug, searchListings } from "@/lib/data/repository";
import { getSession } from "@/lib/auth/session";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ListingImageGallery } from "@/components/listings/ListingImageGallery";
import { ListingDetailActions } from "@/components/listings/ListingDetailActions";
import { ListingCard } from "@/components/listings/ListingCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CONDITION_LABELS: Record<string, string> = {
  NEW_CONDITION: "Brand New",
  LIKE_NEW: "Like New",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  FOR_PARTS: "For Parts / Not Working",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return {
      title: "Listing Not Found | Meridian Marketplace",
      description: "The requested listing could not be found.",
    };
  }

  const snippet =
    listing.description.length > 155
      ? `${listing.description.slice(0, 155)}...`
      : listing.description;

  const ogImages =
    listing.images && listing.images.length > 0
      ? [{ url: listing.images[0].url, alt: listing.title }]
      : [];

  return {
    title: `${listing.title} - ${formatPrice(listing.price, listing.currency, listing.priceType)} | Meridian`,
    description: snippet,
    openGraph: {
      title: listing.title,
      description: snippet,
      type: "article",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description: snippet,
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getSession();

  // Load listing with visibility guard
  const listing = await getListingBySlug(slug, session?.id, session?.role);
  if (!listing) {
    notFound();
  }

  const isOwner = Boolean(session && session.id === listing.seller.id);

  // Fetch related listings in same category
  const relatedData = await searchListings({
    category: listing.categorySlug,
    limit: 5,
  });
  const relatedListings = relatedData.listings
    .filter((item) => item.id !== listing.id)
    .slice(0, 4);

  const conditionDisplay = listing.condition
    ? CONDITION_LABELS[listing.condition] || listing.condition
    : "Good";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation / Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link
            href={`/category/${listing.categorySlug}`}
            className="hover:text-slate-900 transition-colors"
          >
            {listing.categoryName}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link
            href={`/location/${listing.locationSlug}`}
            className="hover:text-slate-900 transition-colors"
          >
            {listing.locationName}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-xs">
            {listing.title}
          </span>
        </nav>

        {/* Private / Non-published status alert */}
        {listing.status && listing.status !== "PUBLISHED" && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Unpublished Listing Preview ({listing.status})</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                This listing is currently {listing.status.toLowerCase().replace("_", " ")} and is only visible to you
                and the moderation team.
              </p>
            </div>
          </div>
        )}

        {/* Main Grid: Left content, Right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Gallery */}
            <ListingImageGallery images={listing.images} title={listing.title} />

            {/* Quick Specs / Details */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-subtle flex flex-col gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {listing.badges.isVip && (
                    <Badge variant="vip" size="sm">
                      VIP Listing
                    </Badge>
                  )}
                  {listing.badges.isFeatured && (
                    <Badge variant="featured" size="sm">
                      Featured
                    </Badge>
                  )}
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                    {conditionDisplay}
                  </span>
                  {listing.isNegotiable && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                      Price Negotiable
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {listing.title}
                </h1>

                {/* Metadata tags */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{listing.locationName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Posted {formatRelativeTime(listing.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{listing.viewsCount} views</span>
                  </div>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60">
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                    Condition
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
                    {conditionDisplay}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60">
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                    Pricing Mode
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block capitalize">
                    {listing.priceType || "Fixed"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60">
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                    Category
                  </span>
                  <Link
                    href={`/category/${listing.categorySlug}`}
                    className="font-bold text-brand-600 hover:text-brand-700 text-sm mt-0.5 block truncate"
                  >
                    {listing.categoryName}
                  </Link>
                </div>
              </div>

              {/* Description Body */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                  Description
                </h2>
                <div className="text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                  {listing.description}
                </div>
              </div>
            </div>

            {/* Safety & Trust Tips */}
            <div className="rounded-2xl p-5 bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-emerald-900">Meridian Safety Guidelines</h3>
              </div>
              <ul className="text-xs text-emerald-800 space-y-1.5 list-disc list-inside">
                <li>Meet the seller in a well-lit, public location.</li>
                <li>Inspect items thoroughly before completing payment.</li>
                <li>Never send funds via wire transfer or untraceable gift cards.</li>
                <li>Report suspicious listings immediately to help keep our community safe.</li>
              </ul>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="flex flex-col gap-6">
            {/* Price & Actions Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-subtle flex flex-col gap-5">
              <div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                  Asking Price
                </span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatPrice(listing.price, listing.currency, listing.priceType)}
                </div>
                {listing.isNegotiable && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Seller is open to reasonable negotiations
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <ListingDetailActions
                listingId={listing.id}
                listingSlug={listing.slug}
                sellerId={listing.seller.id}
                sellerName={listing.seller.name}
                sellerPhone={listing.contactPhone}
                isOwner={isOwner}
                initialFavorited={Boolean(listing.isFavorited)}
                currentUserId={session?.id}
              />
            </div>

            {/* Seller Information Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-subtle flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Seller Information
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-base shrink-0">
                  {listing.seller.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-base truncate">
                      {listing.seller.name}
                    </span>
                    {listing.seller.isVerified && (
                      <Badge variant="verified" size="sm">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">
                      {listing.seller.rating.toFixed(1)}
                    </span>
                    <span>({listing.seller.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col gap-2 text-xs text-slate-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {listing.seller.responseTime || "< 1 hour"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(listing.seller.memberSince).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <Link
                href={`/search?query=${encodeURIComponent(listing.seller.name)}`}
                className="mt-2 text-center text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                View all items from this seller &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Related Listings Section */}
        {relatedListings.length > 0 && (
          <div className="mt-14 pt-10 border-t border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Related Listings in {listing.categoryName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore similar items available in your marketplace
                </p>
              </div>
              <Link
                href={`/category/${listing.categorySlug}`}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedListings.map((rel) => (
                <ListingCard key={rel.id} listing={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
