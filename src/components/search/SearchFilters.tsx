"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, Check } from "lucide-react";
import { CATEGORIES } from "@/lib/data/categories";
import { LOCATIONS } from "@/lib/data/locations";
import { Button } from "../ui/Button";

export const SearchFilters: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "all";
  const currentLocation = searchParams.get("location") || "all";
  const currentCondition = searchParams.get("condition") || "all";
  const currentSort = searchParams.get("sortBy") || "newest";
  const currentVerified = searchParams.get("verifiedOnly") === "true";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const [category, setCategory] = useState(currentCategory);
  const [location, setLocation] = useState(currentLocation);
  const [condition, setCondition] = useState(currentCondition);
  const [sortBy, setSortBy] = useState(currentSort);
  const [verifiedOnly, setVerifiedOnly] = useState(currentVerified);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (currentQ) params.set("q", currentQ);
    if (category && category !== "all") params.set("category", category);
    if (location && location !== "all") params.set("location", location);
    if (condition && condition !== "all") params.set("condition", condition);
    if (sortBy && sortBy !== "newest") params.set("sortBy", sortBy);
    if (verifiedOnly) params.set("verifiedOnly", "true");
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    router.push(`/search?${params.toString()}`);
  };

  const handleReset = () => {
    setCategory("all");
    setLocation("all");
    setCondition("all");
    setSortBy("newest");
    setVerifiedOnly(false);
    setMinPrice("");
    setMaxPrice("");
    const params = new URLSearchParams();
    if (currentQ) params.set("q", currentQ);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <aside className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Filter Results</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Sort Order
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full text-xs font-medium rounded-lg border border-slate-200 py-2 px-3 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-600"
        >
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Condition Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Item Condition
        </label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full text-xs font-medium rounded-lg border border-slate-200 py-2 px-3 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-600"
        >
          <option value="all">All Conditions</option>
          <option value="NEW_CONDITION">Brand New</option>
          <option value="LIKE_NEW">Like New</option>
          <option value="EXCELLENT">Excellent</option>
          <option value="GOOD">Good</option>
          <option value="FAIR">Fair</option>
          <option value="FOR_PARTS">For Parts / Not Working</option>
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full text-xs font-medium rounded-lg border border-slate-200 py-2 px-3 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-600"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Metro Region
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full text-xs font-medium rounded-lg border border-slate-200 py-2 px-3 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-600"
        >
          <option value="all">All Regions</option>
          {LOCATIONS.map((loc) => (
            <option key={loc.id} value={loc.slug}>
              {loc.name} ({loc.state})
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Price Range ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 py-2 px-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-600"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 py-2 px-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-brand-600"
          />
        </div>
      </div>

      {/* Verified Sellers Toggle */}
      <div className="pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-800">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>Verified Sellers Only</span>
        </label>
      </div>

      {/* Apply Button */}
      <Button
        type="button"
        variant="primary"
        size="md"
        className="w-full text-xs font-semibold"
        onClick={handleApplyFilters}
      >
        Apply Filters
      </Button>
    </aside>
  );
};
