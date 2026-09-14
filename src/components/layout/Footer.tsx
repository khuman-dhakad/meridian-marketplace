import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Heart, ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/data/categories";
import { LOCATIONS } from "@/lib/data/locations";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm mt-auto">
      {/* Upper Footer: Newsletter / Safety Promise */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-white font-bold text-base tracking-tight">
                  Meridian Verified Marketplace Standard
                </h3>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                We prioritize user safety, authentic local seller verification, and prompt moderation.
                Trade transparently and safely in your community.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/post-ad"
                className="px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold text-xs sm:text-sm hover:bg-brand-500 transition-colors inline-flex items-center gap-1.5"
              >
                Post a Free Listing
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/#trust-safety"
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm hover:bg-slate-700 transition-colors"
              >
                Safety Guidelines
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                M
              </div>
              <span>MERIDIAN</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              The next-generation classified directory and local trade platform. Connecting verified sellers
              and buyers with trust, speed, and transparency.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Platform Status: Operational
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-xs">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-white transition-colors block truncate"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Locations */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Top Metro Areas
            </h4>
            <ul className="space-y-2.5 text-xs">
              {LOCATIONS.slice(0, 6).map((loc) => (
                <li key={loc.id}>
                  <Link
                    href={`/location/${loc.slug}`}
                    className="hover:text-white transition-colors block truncate"
                  >
                    {loc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User & Advertiser Portals */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Platform & Portals
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/post-ad" className="hover:text-white transition-colors">
                  Post New Listing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Dealer Registration
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Moderation Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Legal */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#trust-safety" className="hover:text-white transition-colors">
                  Trust & Safety Guide
                </Link>
              </li>
              <li>
                <Link href="/#trust-safety" className="hover:text-white transition-colors">
                  Report Suspicious Ad
                </Link>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-white transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-white transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-white transition-colors">
                  Cookie Preferences
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div className="border-t border-slate-800 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; {new Date().getFullYear()} Meridian Marketplace Technologies. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-[11px] text-slate-500">
            Engineered for high performance, accessibility, and safe local commerce.
          </p>
        </div>
      </div>
    </footer>
  );
};
