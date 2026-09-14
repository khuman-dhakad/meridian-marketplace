"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { LOCATIONS } from "@/lib/data/locations";
import { MapPin, Search, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocationSlug?: string;
  onSelectLocation?: (slug: string, name: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocationSlug,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredLocations = LOCATIONS.filter((loc) => {
    const q = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.subAreas.some((s) => s.name.toLowerCase().includes(q))
    );
  });

  const handleSelect = (slug: string, name: string) => {
    if (onSelectLocation) {
      onSelectLocation(slug, name);
    } else {
      router.push(`/location/${slug}`);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Your Region"
      description="Choose your metropolitan area to see local verified listings near you."
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search city, metro, or neighborhood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
          />
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
          <button
            type="button"
            onClick={() => handleSelect("all", "All Locations (Nationwide)")}
            className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600">
                  All Locations (Nationwide)
                </p>
                <p className="text-xs text-slate-500">Browse listings across all regions</p>
              </div>
            </div>
            {(!currentLocationSlug || currentLocationSlug === "all") && (
              <Check className="w-4 h-4 text-brand-600" />
            )}
          </button>

          {filteredLocations.map((loc) => {
            const isSelected = currentLocationSlug === loc.slug;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelect(loc.slug, loc.name)}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isSelected
                        ? "bg-brand-100 text-brand-700"
                        : "bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600">
                        {loc.name}
                      </p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                        {loc.state}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {loc.listingCount.toLocaleString()} listings &bull;{" "}
                      {loc.subAreas.map((s) => s.name).slice(0, 2).join(", ")}
                    </p>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand-600" />}
              </button>
            );
          })}

          {filteredLocations.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No regions matching &quot;{searchQuery}&quot;. Try a broader location search.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
