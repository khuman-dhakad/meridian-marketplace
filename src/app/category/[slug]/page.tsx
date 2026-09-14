import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategories, searchListings } from "@/lib/data/repository";
import { ListingCard } from "@/components/listings/ListingCard";
import { ArrowLeft, Tag, Layers, PlusCircle } from "lucide-react";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${category.name} Listings & Classifieds`,
    description: `Discover local verified ads for ${category.name}. ${category.description}`,
    openGraph: {
      title: `${category.name} | Meridian Marketplace`,
      description: category.description,
    },
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { listings, total } = await searchListings({ category: slug });

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
          <Link href="/search" className="hover:text-slate-900">
            Categories
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{category.name}</span>
        </div>

        {/* Category Hero Header */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 mb-8 shadow-subtle">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
                <Tag className="w-3.5 h-3.5" />
                <span>Marketplace Category</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {category.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {category.description}
              </p>
            </div>

            <Link
              href={`/post-ad?category=${category.slug}`}
              className="px-5 py-3 rounded-xl bg-brand-600 text-white text-xs sm:text-sm font-semibold hover:bg-brand-700 transition-colors inline-flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post an Ad in {category.name}</span>
            </Link>
          </div>

          {/* Subcategories list */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>Subcategories ({category.subcategories.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/search?category=${category.slug}&q=${encodeURIComponent(sub.name)}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-xs font-medium transition-colors"
                >
                  {sub.name} <span className="text-slate-400 font-normal">({sub.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Listings in this Category */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Active Listings in {category.name} ({total})
            </h2>
            <Link
              href={`/search?category=${category.slug}`}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              View Filtered Results &rarr;
            </Link>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-subtle">
              <p className="text-sm text-slate-500">
                Currently no active ads in this exact category.
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
