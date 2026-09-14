import React from "react";
import Link from "next/link";
import {
  Car,
  Home,
  Laptop,
  Briefcase,
  Armchair,
  GraduationCap,
  Factory,
  Users,
  LucideIcon,
  ArrowRight,
} from "lucide-react";
import { Category } from "@/lib/types";

const iconMap: Record<string, LucideIcon> = {
  Car,
  Home,
  Laptop,
  Briefcase,
  Armchair,
  GraduationCap,
  Factory,
  Users,
};

export interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const IconComponent = iconMap[category.icon] || Briefcase;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative flex flex-col p-5 bg-white rounded-xl border border-slate-200/90 hover:border-brand-500/40 hover:shadow-card-hover transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-100 transition-colors">
          <IconComponent className="w-6 h-6" aria-hidden="true" />
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
          {category.listingCount.toLocaleString()} ads
        </span>
      </div>

      <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors">
        {category.name}
      </h3>

      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
        {category.description}
      </p>

      {/* Subcategory pills preview */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">
          {category.subcategories.slice(0, 2).map((s) => s.name).join(", ")}
        </span>
        <span className="text-xs font-semibold text-brand-600 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          Explore
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
};
