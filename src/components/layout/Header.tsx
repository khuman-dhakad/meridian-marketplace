"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Menu, PlusCircle, Search, ShieldCheck, ChevronDown, Sparkles } from "lucide-react";
import { LocationModal } from "./LocationModal";
import { MobileNav } from "./MobileNav";
import { SessionUser } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";

export interface HeaderProps {
  initialUser?: SessionUser | null;
}

export const Header: React.FC<HeaderProps> = ({ initialUser }) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ slug: string; name: string }>({
    slug: "all",
    name: "All Regions",
  });

  const handleSelectLocation = (slug: string, name: string) => {
    setSelectedLocation({ slug, name });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        {/* Top utility alert or announcement bar */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Classifieds:
              </span>
              <span>All active listings are monitored for safety and authentic local seller profiles.</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <Link href="/#trust-safety" className="hover:text-white transition-colors">
                Safety Center
              </Link>
              <span className="text-slate-700">|</span>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                {initialUser ? "My Account" : "Dealer & Business Portal"}
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Brand Logo & Location */}
            <div className="flex items-center gap-4 lg:gap-8">
              <Link
                href="/"
                className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-lg group"
                aria-label="Meridian Marketplace Home"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <span className="font-extrabold text-base tracking-wider font-sans">M</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl font-sans leading-none flex items-center gap-1">
                    MERIDIAN
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase mt-0.5 hidden sm:inline">
                    Verified Marketplace
                  </span>
                </div>
              </Link>

              {/* Location Selector (Desktop) */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden md:flex items-center gap-2 py-1.5 px-3 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors border border-slate-200/60"
                aria-label={`Select location, currently ${selectedLocation.name}`}
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span className="max-w-[130px] truncate">{selectedLocation.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
              <Link
                href="/search"
                className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors flex items-center gap-1.5"
              >
                <Search className="w-4 h-4 text-slate-400" />
                Browse Listings
              </Link>
              <Link
                href="/#categories"
                className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/#locations"
                className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
              >
                Locations
              </Link>
              <Link
                href="/#trust-safety"
                className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Trust & Safety
              </Link>
            </nav>

            {/* Actions: Auth & Post Ad Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Location Selector (Mobile button) */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="md:hidden flex items-center p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Change location"
              >
                <MapPin className="w-5 h-5 text-brand-600" />
              </button>

              {/* User Account Controls */}
              {initialUser ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {initialUser.name[0]?.toUpperCase()}
                    </span>
                    <span className="max-w-[100px] truncate">{initialUser.name}</span>
                  </Link>

                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1">
                  <Link
                    href="/login"
                    className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Post Ad CTA */}
              <Link
                href="/post-ad"
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-brand-600 text-white text-xs sm:text-sm font-semibold hover:bg-brand-700 active:bg-brand-800 shadow-sm hover:shadow transition-all group"
              >
                <PlusCircle className="w-4 h-4 text-brand-200 group-hover:text-white transition-colors" />
                <span>Post Your Ad</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                aria-label="Open mobile menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocationSlug={selectedLocation.slug}
        onSelectLocation={handleSelectLocation}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        currentLocationName={selectedLocation.name}
      />
    </>
  );
};
