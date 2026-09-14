import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Users,
  Layers,
  ArrowLeft,
} from "lucide-react";

export default function AdminPage() {
  const pendingModerations = [
    {
      id: "mod-101",
      title: "Commercial Generator 45kW Diesel Power Unit",
      seller: "PowerEquip Direct",
      category: "Commercial & Industrial",
      location: "Chicago Area, IL",
      flagReason: "High-value asset requires proof of ownership documentation",
      submittedAt: "25 minutes ago",
    },
    {
      id: "mod-102",
      title: "2021 Toyota RAV4 Hybrid XLE - Low Mileage",
      seller: "Midwest Auto Trader LLC",
      category: "Vehicles & Automotive",
      location: "Denver Metro, CO",
      flagReason: "New dealer account verification audit",
      submittedAt: "1 hour ago",
    },
    {
      id: "mod-103",
      title: "Executive Penthouse 3BR River North",
      seller: "Summit Luxury Residences",
      category: "Real Estate & Rentals",
      location: "Chicago Area, IL",
      flagReason: "Routine rental license validation check",
      submittedAt: "3 hours ago",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Platform Operations &amp; Moderation Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Meridian Trust &amp; Safety Control Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Review flagged listings, manage advertiser verification pipelines, and monitor platform compliance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              Live Auditing Active
            </span>
          </div>
        </div>

        {/* Admin KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Ad Reviews
            </span>
            <div className="mt-2 text-2xl font-extrabold text-amber-600">3 Items</div>
            <p className="text-xs text-slate-400 mt-1">Average resolution: 18m</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Spam Shield Intercepts
            </span>
            <div className="mt-2 text-2xl font-extrabold text-rose-600">42 Today</div>
            <p className="text-xs text-slate-400 mt-1">Automated honeypot triggers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verified Seller Profiles
            </span>
            <div className="mt-2 text-2xl font-extrabold text-emerald-600">1,280 Active</div>
            <p className="text-xs text-slate-400 mt-1">KYC validated</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Classified Inventory
            </span>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">24,850 Live</div>
            <p className="text-xs text-slate-400 mt-1">Across 8 major metros</p>
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Active Moderation Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Classified ads held by automated risk signals awaiting staff verification.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-700">
              3 Pending Tasks
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingModerations.map((item) => (
              <div key={item.id} className="p-6 space-y-3 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.id}
                    </span>
                    <span className="text-xs font-semibold text-brand-600">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400">&bull; {item.submittedAt}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{item.location}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Submitted by: <strong className="text-slate-800">{item.seller}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200/70">
                  <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Flag Reason: {item.flagReason}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    Inspect Details
                  </button>
                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Ad
                  </button>
                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve &amp; Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
