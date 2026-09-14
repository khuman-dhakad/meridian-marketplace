import React from "react";
import {
  ShieldCheck,
  UserCheck,
  Flag,
  Lock,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";

export const TrustSafetySection: React.FC = () => {
  const safetyFeatures = [
    {
      icon: UserCheck,
      title: "Seller Identity Verification",
      description:
        "Verified badge holders submit government ID and phone confirmation to foster accountability and reduce fraudulent activity.",
    },
    {
      icon: Lock,
      title: "Privacy-Preserving Contact",
      description:
        "Communicate with counterparties through protected message relays. Your personal phone number and email remain private until you share them.",
    },
    {
      icon: Flag,
      title: "Community Moderation & Reporting",
      description:
        "Report suspicious ads or non-compliant content with one click. Our moderation team reviews flagged listings promptly around the clock.",
    },
    {
      icon: FileCheck2,
      title: "Transparent Ad Standards",
      description:
        "Every classified posting is subject to clear marketplace quality guidelines preventing spam, deceptive offers, and prohibited goods.",
    },
  ];

  return (
    <section id="trust-safety" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-800 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Integrity &amp; Community Standards</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built from the Ground Up for Trust &amp; Safety
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Local commerce works best when both buyers and sellers operate with transparency.
            Meridian implements proactive safety measures while empowering you with practical guidelines.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {safetyFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Practical In-Person Trade Safety Tips Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Smart Trading Best Practices</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              Meet in Public &amp; Never Wire Untraceable Funds
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Always inspect high-value items in well-lit public places (such as designated police department
              meetup zones, banks, or busy cafe lobbies). Never send wire transfers or gift cards for unverified transactions.
            </p>
          </div>
          <a
            href="mailto:safety@meridianmarketplace.local"
            className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors shrink-0"
          >
            Contact Safety Desk
          </a>
        </div>
      </div>
    </section>
  );
};
