import React from "react";
import Link from "next/link";
import { CategoryCard } from "./CategoryCard";
import { Category } from "@/lib/types";
import { ArrowRight, Grid } from "lucide-react";

export interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <section id="categories" className="py-14 sm:py-20 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-semibold text-xs tracking-wider uppercase mb-1">
              <Grid className="w-4 h-4" />
              <span>Taxonomy &amp; Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore by Category
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Browse curated listings across major marketplace verticals.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline"
          >
            <span>View All Classifieds</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};
