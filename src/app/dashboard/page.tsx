import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  Eye,
  MessageSquare,
  Bookmark,
  LogOut,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getUserListings } from "@/lib/data/repository";
import { formatPrice } from "@/lib/utils";
import { logoutAction } from "@/lib/auth/actions";
import { Listing } from "@/lib/types";

export default async function DashboardPage() {
  // 1. Server-side session verification guard
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // 2. Fetch authenticated user's real listings from database
  let userListings: Listing[] = [];
  let dbError: string | null = null;

  try {
    userListings = await getUserListings(session.id);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database unavailable";
    dbError = msg;
  }

  const userInitials = session.name
    ? session.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ME";

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Database Notice if offline */}
        {dbError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Database Service Notice: {dbError} Live listing persistence requires an active PostgreSQL connection.
            </span>
          </div>
        )}

        {/* Top Profile & Verification Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {session.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  Role: {session.role}
                </span>
                {session.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Seller
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Authenticated Account: {session.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/post-ad"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs sm:text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Classified</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                My Active Listings
              </span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {userListings.length}
              </span>
              <span className="text-xs text-slate-400">Database verified</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Listing Views
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {userListings.reduce((sum, l) => sum + (l.viewsCount || 0), 0)}
              </span>
              <span className="text-xs text-slate-400">Total views</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Buyer Inquiries
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">0</span>
              <span className="text-xs text-slate-400">No pending messages</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Saved Favorites
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">0</span>
              <span className="text-xs text-slate-400">Saved items</span>
            </div>
          </div>
        </div>

        {/* My Real Database Listings Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                My Classified Postings ({userListings.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Listings saved under your authenticated account ({session.email}).
              </p>
            </div>
            <Link
              href="/post-ad"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              + Create New Ad
            </Link>
          </div>

          {userListings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {userListings.map((listing) => (
                <div
                  key={listing.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                        Published
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {listing.categoryName}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{listing.title}</h3>
                    <p className="text-xs text-slate-500">
                      {listing.locationName} &bull; {listing.viewsCount} views &bull; Created{" "}
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No active listings yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven&apos;t posted any classified ads yet. Post your vehicle, property, service, or items to start reaching local buyers.
              </p>
              <Link
                href="/post-ad"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post Your First Ad</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
