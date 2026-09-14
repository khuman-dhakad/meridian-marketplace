import React from "react";
import Link from "next/link";
import { ArrowLeft, Search, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-subtle border border-brand-100">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Listing or Page Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            The classified listing or directory route you are looking for may have expired, been sold,
            or moved to another location.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Search Active Listings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
