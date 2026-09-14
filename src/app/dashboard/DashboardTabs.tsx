"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  PlusCircle,
  Bookmark,
  Edit,
  Archive,
  ExternalLink,
} from "lucide-react";
import { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ListingCard } from "@/components/listings/ListingCard";
import { handleArchiveListingAction } from "@/lib/auth/actions";

interface DashboardTabsProps {
  userListings: Listing[];
  userFavorites: Listing[];
  userEmail: string;
}

const CONDITION_LABELS: Record<string, string> = {
  NEW_CONDITION: "Brand New",
  LIKE_NEW: "Like New",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  FOR_PARTS: "For Parts",
};

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  userListings,
  userFavorites,
  userEmail,
}) => {
  const [activeTab, setActiveTab] = useState<"listings" | "favorites">("listings");

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-subtle overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-zinc-800 px-6 pt-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "listings"
                ? "border-brand-600 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>My Classified Postings</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
              {userListings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("favorites")}
            className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "favorites"
                ? "border-brand-600 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Saved Favorites</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
              {userFavorites.length}
            </span>
          </button>
        </div>

        {activeTab === "listings" && (
          <Link
            href="/post-ad"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline mb-3"
          >
            + Create New Ad
          </Link>
        )}
      </div>

      {/* TAB CONTENT: MY LISTINGS */}
      {activeTab === "listings" && (
        <div>
          {userListings.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {userListings.map((listing) => {
                const isArchived = listing.status === "ARCHIVED";
                const conditionLabel = listing.condition
                  ? CONDITION_LABELS[listing.condition] || listing.condition
                  : null;

                return (
                  <div
                    key={listing.id}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {isArchived ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[11px] font-semibold">
                            Archived
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                            Published
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-medium">
                          {listing.categoryName}
                        </span>
                        {conditionLabel && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            {conditionLabel}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        <Link
                          href={`/listing/${listing.slug}`}
                          className="hover:text-brand-600 transition-colors"
                        >
                          {listing.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {listing.locationName} &bull; {listing.viewsCount} views &bull; Created{" "}
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 flex-wrap sm:flex-nowrap">
                      <div className="text-left sm:text-right">
                        <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                          {formatPrice(listing.price, listing.currency, listing.priceType)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/listing/${listing.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View</span>
                        </Link>

                        <Link
                          href={`/dashboard/listings/${listing.id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-2xs"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>

                        {!isArchived && (
                          <form action={handleArchiveListingAction}>
                            <input type="hidden" name="listingId" value={listing.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Archive listing"
                            >
                              <Archive className="w-3 h-3" />
                              <span>Archive</span>
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No active listings yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                You haven&apos;t posted any classified ads yet. Post your vehicle, property, service,
                or items to start reaching local buyers.
              </p>
              <Link
                href="/post-ad"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post Your First Ad</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SAVED FAVORITES */}
      {activeTab === "favorites" && (
        <div className="p-6 sm:p-8">
          {userFavorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userFavorites.map((fav) => (
                <ListingCard key={fav.id} listing={fav} initialFavorited={true} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No saved favorites yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                Save interesting classifieds by clicking the heart icon on any listing card or detail page.
              </p>
              <Link
                href="/search"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Explore Marketplace
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
