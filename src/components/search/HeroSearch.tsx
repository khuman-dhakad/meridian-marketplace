"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Tag, ArrowRight, ShieldCheck } from "lucide-react";
import { CATEGORIES } from "@/lib/data/categories";
import { LOCATIONS } from "@/lib/data/locations";

export const HeroSearch: React.FC = () => {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = ((formData.get("q") as string) || keyword).trim();
    const cat = (formData.get("category") as string) || selectedCategory;
    const loc = (formData.get("location") as string) || selectedLocation;

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat && cat !== "all") params.set("category", cat);
    if (loc && loc !== "all") params.set("location", loc);

    router.push(`/search?${params.toString()}`);
  };

  const trendingTags = [
    { label: "Tesla Model 3", query: "Tesla" },
    { label: "MacBook Pro", query: "MacBook" },
    { label: "Apartments for Rent", category: "real-estate-rentals" },
    { label: "Home Repairs", category: "professional-services" },
    { label: "Espresso Machine", query: "Espresso" },
  ];

  const handleTrendingClick = (tag: { query?: string; category?: string }) => {
    const params = new URLSearchParams();
    if (tag.query) params.set("q", tag.query);
    if (tag.category) params.set("category", tag.category);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-14 sm:py-20 lg:py-24">
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />
      {/* Ambient glow accent */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust pill */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Seller Verification &bull; No Spam Policy</span>
          </span>
        </div>

        {/* Hero Headings */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Discover Verified Local Listings &amp; Trade Safely
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Connect directly with verified local sellers, licensed service providers, and genuine buyers
            in your metropolitan community.
          </p>
        </div>

        {/* Primary Search Bar Container */}
        <div className="max-w-4xl mx-auto">
          <form
            action="/search"
            method="GET"
            onSubmit={handleSearch}
            className="bg-white p-2 sm:p-3 rounded-2xl shadow-elevated border border-slate-200/20 text-slate-900 flex flex-col md:flex-row items-stretch gap-2"
          >
            {/* Keyword Field */}
            <div className="flex-1 relative flex items-center min-w-0">
              <Search className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                name="q"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="What are you looking for? (e.g. Tesla, 2BR Loft, MacBook)"
                className="w-full pl-11 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 bg-transparent"
                aria-label="Search keywords"
              />
            </div>

            <div className="hidden md:block w-px bg-slate-200 my-2" aria-hidden="true" />

            {/* Category Dropdown */}
            <div className="w-full md:w-56 relative flex items-center">
              <Tag className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="w-full pl-10 pr-8 py-3 text-sm text-slate-800 rounded-xl bg-transparent appearance-none focus:outline-none focus:ring-2 focus:ring-brand-600/20 cursor-pointer font-medium"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>

            <div className="hidden md:block w-px bg-slate-200 my-2" aria-hidden="true" />

            {/* Location Dropdown */}
            <div className="w-full md:w-52 relative flex items-center">
              <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                name="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Filter by location"
                className="w-full pl-10 pr-8 py-3 text-sm text-slate-800 rounded-xl bg-transparent appearance-none focus:outline-none focus:ring-2 focus:ring-brand-600/20 cursor-pointer font-medium"
              >
                <option value="all">All Locations</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.slug}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>

            {/* Search Submit CTA Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 active:bg-brand-700 shadow-sm transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span>Search Listings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Trending Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-400">Trending Now:</span>
            {trendingTags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTrendingClick(tag)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
