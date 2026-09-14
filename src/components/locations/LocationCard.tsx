import React from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { Location } from "@/lib/types";

export interface LocationCardProps {
  location: Location;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  return (
    <Link
      href={`/location/${location.slug}`}
      className="group relative flex flex-col justify-between p-5 bg-white rounded-xl border border-slate-200/90 hover:border-brand-500/40 hover:shadow-card-hover transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-brand-600">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              {location.state}
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
            {location.listingCount.toLocaleString()} ads
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
          {location.name}
        </h3>

        {/* Subareas preview */}
        <div className="mt-2.5 flex flex-wrap gap-1 text-[11px] text-slate-500">
          {location.subAreas.slice(0, 3).map((sub, idx) => (
            <span key={sub.id} className="inline-flex items-center">
              {sub.name}
              {idx < Math.min(location.subAreas.length, 3) - 1 && (
                <span className="mx-1 text-slate-300">&bull;</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600">
        <span>Browse Regional Ads</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
