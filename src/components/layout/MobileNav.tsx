"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, PlusCircle, MapPin, Search, Shield, User, LogIn, LayoutDashboard } from "lucide-react";
import { CATEGORIES } from "@/lib/data/categories";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLocationModal: () => void;
  currentLocationName?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  onOpenLocationModal,
  currentLocationName = "Select Location",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              M
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">
              MERIDIAN
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          {/* Post Ad CTA */}
          <Link
            href="/post-ad"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-brand-600 text-white font-semibold shadow-sm hover:bg-brand-700 active:bg-brand-800 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Post Your Ad
          </Link>

          {/* Location Trigger */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLocationModal();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Browsing Region</p>
                <p className="text-sm font-semibold text-slate-900 truncate max-w-[190px]">
                  {currentLocationName}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-brand-600">Change</span>
          </button>

          {/* Main Links */}
          <nav className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Explore
            </p>
            <Link
              href="/search"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
            >
              <Search className="w-4 h-4 text-slate-400" />
              Browse All Listings
            </Link>
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              My Dashboard
            </Link>
            <Link
              href="/#trust-safety"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              Safety & Verification
            </Link>
          </nav>

          {/* Categories */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Categories
            </p>
            <div className="grid grid-cols-1 gap-1 max-h-56 overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {cat.listingCount.toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer / Account */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2">
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            Sign In
          </Link>
          <Link
            href="/register"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors"
          >
            <User className="w-4 h-4 text-slate-400" />
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
