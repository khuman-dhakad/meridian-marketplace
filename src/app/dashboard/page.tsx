import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  Eye,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { LISTINGS } from "@/lib/data/listings";
import { formatPrice } from "@/lib/utils";

export default function DashboardPage() {
  const userListings = LISTINGS.slice(0, 3);

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Profile & Verification Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              MV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Marcus Vance
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Seller
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Member since March 2022 &bull; 99.5% Positive Feedback (38 Reviews) &bull; Response Time &lt; 15 mins
              </p>
            </div>
          </div>

          <Link
            href="/post-ad"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white text-xs sm:text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Classified</span>
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Listings
              </span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">3</span>
              <span className="text-xs text-emerald-600 font-medium">+1 this week</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Ad Impressions
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">1,432</span>
              <span className="text-xs text-emerald-600 font-medium">+18% vs last month</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Inquiries &amp; Messages
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">14</span>
              <span className="text-xs text-slate-400">All answered</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Saved / Watchlisted
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">8</span>
              <span className="text-xs text-slate-400">Saved items</span>
            </div>
          </div>
        </div>

        {/* My Active Listings Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                My Active Classified Listings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your posted listings, update pricing, or renew promotions.
              </p>
            </div>
            <Link
              href="/post-ad"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              + Create Listing
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {userListings.map((listing) => (
              <div
                key={listing.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                      Live
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {listing.categoryName}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {listing.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {listing.locationName} &bull; {listing.viewsCount} views &bull; Posted{" "}
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {formatPrice(listing.price, listing.currency, listing.priceType)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/search?q=${encodeURIComponent(listing.title)}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      View Live
                    </Link>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-brand-50 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
                    >
                      Boost VIP
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
