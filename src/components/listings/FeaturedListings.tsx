"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ListingCard } from "./ListingCard";
import { Listing } from "@/lib/types";
import { Sparkles, ArrowRight } from "lucide-react";

export interface FeaturedListingsProps {
  initialListings: Listing[];
}

export const FeaturedListings: React.FC<FeaturedListingsProps> = ({ initialListings }) => {
  const [activeTab, setActiveTab] = useState<string>("all");

  const tabs = [
    { id: "all", label: "All Featured" },
    { id: "vehicles-automotive", label: "Vehicles" },
    { id: "real-estate-rentals", label: "Real Estate" },
    { id: "electronics-gadgets", label: "Electronics" },
    { id: "professional-services", label: "Services" },
  ];

  const filteredListings =
    activeTab === "all"
      ? initialListings
      : initialListings.filter((item) => item.categorySlug === activeTab);

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Handpicked &amp; Verified</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Marketplace Listings
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Browse top-rated classified advertisements verified by the Meridian team.
            </p>
          </div>

          {/* Category Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-full overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredListings.slice(0, 8).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">No listings found in this category yet.</p>
            <Link
              href="/post-ad"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
            >
              Be the first to post an ad here &rarr;
            </Link>
          </div>
        )}

        {/* Bottom browse all link */}
        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <span>Explore All 24,000+ Verified Ads</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
