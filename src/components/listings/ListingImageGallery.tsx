"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface ListingImageGalleryProps {
  images: { url: string; alt?: string }[];
  title: string;
}

export const ListingImageGallery: React.FC<ListingImageGalleryProps> = ({
  images,
  title,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const validImages = images && images.length > 0 ? images : [];
  const currentImage = validImages[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  };

  if (validImages.length === 0) {
    return (
      <div className="relative aspect-[16/10] w-full rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
        <ImageIcon className="w-16 h-16 text-slate-300 dark:text-zinc-600 mb-2" />
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">No photos uploaded for this listing</p>
      </div>
    );
  }

  const isFailed = failedImages[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image View */}
      <div className="relative aspect-[16/10] w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-subtle group">
        {!isFailed ? (
          <Image
            src={currentImage.url}
            alt={currentImage.alt || `${title} - Photo ${activeIndex + 1}`}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
            className="object-contain"
            onError={() => {
              setFailedImages((prev) => ({ ...prev, [activeIndex]: true }));
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <ImageIcon className="w-12 h-12 text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">Photo preview unavailable</p>
          </div>
        )}

        {/* Counter Badge */}
        <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-md bg-slate-950/75 backdrop-blur-xs text-white text-xs font-semibold">
          {activeIndex + 1} / {validImages.length}
        </div>

        {/* Prev / Next buttons if multiple images */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-opacity md:opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-opacity md:opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {validImages.map((img, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={`${img.url}-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`relative w-20 h-14 sm:w-24 sm:h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected
                    ? "border-brand-600 ring-2 ring-brand-500/20"
                    : "border-slate-200 dark:border-zinc-700 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
