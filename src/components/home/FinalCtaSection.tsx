import React from "react";
import Link from "next/link";
import { PlusCircle, CheckCircle2, ArrowRight } from "lucide-react";

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-brand-900 via-slate-900 to-indigo-950 p-8 sm:p-12 lg:p-16 text-white shadow-2xl overflow-hidden border border-slate-800">
          {/* Subtle decoration circles */}
          <div
            className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold uppercase tracking-wider mb-4">
              Direct Advertiser Portal
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to Reach Thousands of Local Buyers?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              List your vehicle, property, professional service, or merchandise in under two minutes.
              Enjoy free basic listings, verified seller badges, and direct customer engagement.
            </p>

            {/* Benefit bullets */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant local neighborhood distribution</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero hidden buyer transaction fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Optional VIP placement upgrades</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct inquiry messages to your inbox</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/post-ad"
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Post Your Free Classified Ad</span>
              </Link>
              <Link
                href="/register"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <span>Dealer &amp; Pro Accounts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
