"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Star, ArrowUpRight, Heart } from "lucide-react";
import { Listing } from "@/lib/types";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import { Badge } from "../ui/Badge";
import { toggleFavoriteAction } from "@/lib/auth/actions";

export interface ListingCardProps {
  listing: Listing;
  initialFavorited?: boolean;
}

const conditionLabels: Record<string, string> = {
  NEW_CONDITION: "Brand New",
  LIKE_NEW: "Like New",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  FOR_PARTS: "For Parts",
};

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  initialFavorited,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isFav, setIsFav] = useState(
    initialFavorited !== undefined ? initialFavorited : Boolean(listing.isFavorited)
  );
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTogglingFav) return;

    setIsTogglingFav(true);
    const prev = isFav;
    setIsFav(!prev);

    try {
      const formData = new FormData();
      formData.append("listingId", listing.id);
      const res = await toggleFavoriteAction(null, formData);
      if (res.error) {
        setIsFav(prev);
      } else if (res.isFavorited !== undefined) {
        setIsFav(res.isFavorited);
      }
    } catch {
      setIsFav(prev);
    } finally {
      setIsTogglingFav(false);
    }
  };

  const conditionDisplay = listing.condition
    ? conditionLabels[listing.condition] || listing.condition
    : null;

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-all duration-200 overflow-hidden">
      {/* Media / Image Container */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        <Link href={`/listing/${listing.slug}`} className="block w-full h-full">
          {listing.images && listing.images.length > 0 && !imageError ? (
            <Image
              src={listing.images[0].url}
              alt={listing.images[0].alt || listing.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {listing.categoryName}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">Verified Photo</span>
            </div>
          )}
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {listing.badges.isVip && (
            <Badge variant="vip" size="sm">
              VIP
            </Badge>
          )}
          {listing.badges.isFeatured && !listing.badges.isVip && (
            <Badge variant="featured" size="sm">
              Featured
            </Badge>
          )}
          {conditionDisplay && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-900/80 text-white backdrop-blur-xs">
              {conditionDisplay}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteToggle}
          disabled={isTogglingFav}
          aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600 transition-all shadow-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFav ? "fill-rose-500 text-rose-500" : "text-slate-500"
            }`}
          />
        </button>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md text-white font-extrabold text-sm tracking-tight shadow-md border border-white/10">
            {formatPrice(listing.price, listing.currency, listing.priceType)}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Time Stamp */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 gap-2">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{listing.locationName}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatRelativeTime(listing.createdAt)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
            <Link
              href={`/listing/${listing.slug}`}
              className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
            >
              {listing.title}
            </Link>
          </h3>

          {/* Short Description */}
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Footer info: Seller rating & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Seller preview */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
            <span className="font-semibold truncate max-w-[120px]">{listing.seller.name}</span>
            <div className="flex items-center gap-0.5 text-amber-600 font-semibold text-[11px] shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{listing.seller.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Contact / Action button */}
          <Link
            href={`/listing/${listing.slug}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-xs font-semibold transition-colors shrink-0"
            aria-label={`View listing: ${listing.title}`}
          >
            <span>Details</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
};
