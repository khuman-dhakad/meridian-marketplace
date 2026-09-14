"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import {
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { Listing } from "@/lib/types";
import { CATEGORIES } from "@/lib/data/categories";
import { LOCATIONS } from "@/lib/data/locations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateListingAction, ActionResponse } from "@/lib/auth/actions";

interface EditListingFormProps {
  listing: Listing;
}

export const EditListingForm: React.FC<EditListingFormProps> = ({ listing }) => {
  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(String(listing.price));
  const [priceType, setPriceType] = useState(listing.priceType || "fixed");
  const [condition, setCondition] = useState(listing.condition || "GOOD");
  const [category, setCategory] = useState(listing.categorySlug);
  const [location, setLocation] = useState(listing.locationSlug);
  const [description, setDescription] = useState(listing.description);
  const [contactPhone, setContactPhone] = useState(listing.contactPhone || "");
  const [isNegotiable, setIsNegotiable] = useState(listing.isNegotiable);

  const initialImages =
    listing.images && listing.images.length > 0
      ? listing.images.map((img) => img.url).filter(Boolean)
      : [""];
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);

  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    updateListingAction,
    null
  );

  const handleAddImageUrl = () => {
    if (imageUrls.length < 8) {
      setImageUrls([...imageUrls, ""]);
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
  };

  const handleImageUrlChange = (index: number, val: string) => {
    const updated = [...imageUrls];
    updated[index] = val;
    setImageUrls(updated);
  };

  const validImages = imageUrls.map((s) => s.trim()).filter(Boolean);

  if (state?.success) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Listing Updated Successfully!
        </h2>
        <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
          Your changes have been saved to the database and published to the marketplace.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Link
            href={`/listing/${state.listingSlug || listing.slug}`}
            className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
          >
            View Updated Listing &rarr;
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="listingId" value={listing.id} />
      <input type="hidden" name="isNegotiable" value={String(isNegotiable)} />
      {validImages.map((url, idx) => (
        <input key={`edit-img-${idx}`} type="hidden" name="images" value={url} />
      ))}

      {state?.error && (
        <div
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Update Failed</p>
            <p>{state.error}</p>
          </div>
        </div>
      )}

      {/* Basic details */}
      <div className="space-y-4">
        <Input
          name="title"
          label="Listing Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          error={state?.fieldErrors?.title?.[0]}
          icon={<FileText className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              name="categorySlug"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm font-medium rounded-lg border border-slate-300 dark:border-zinc-700 py-2.5 px-3.5 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-600"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Condition
            </label>
            <select
              name="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as any)}
              className="w-full text-sm font-medium rounded-lg border border-slate-300 dark:border-zinc-700 py-2.5 px-3.5 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-600"
            >
              <option value="NEW_CONDITION">Brand New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="FOR_PARTS">For Parts / Not Working</option>
            </select>
          </div>
        </div>

        {/* Pricing & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            name="price"
            label="Price ($ USD)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            error={state?.fieldErrors?.price?.[0]}
            icon={<DollarSign className="w-4 h-4" />}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Price Structure
            </label>
            <select
              name="priceType"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value as any)}
              className="w-full text-sm font-medium rounded-lg border border-slate-300 dark:border-zinc-700 py-2.5 px-3.5 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-600"
            >
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
              <option value="monthly">Monthly Rate</option>
              <option value="free">Free</option>
              <option value="contact">Contact for Price</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Metro Region
            </label>
            <select
              name="locationSlug"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-sm font-medium rounded-lg border border-slate-300 dark:border-zinc-700 py-2.5 px-3.5 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-600"
            >
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.slug}>
                  {l.name} ({l.state})
                </option>
              ))}
            </select>
          </div>

          <Input
            name="contactPhone"
            label="Contact Phone (Optional)"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="edit-negotiable"
            type="checkbox"
            checked={isNegotiable}
            onChange={(e) => setIsNegotiable(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="edit-negotiable" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
            Price is negotiable (OBO)
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full text-sm rounded-lg border border-slate-300 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
          />
          {state?.fieldErrors?.description?.[0] && (
            <p className="text-xs text-rose-600 mt-1">{state.fieldErrors.description[0]}</p>
          )}
        </div>
      </div>

      {/* Image URLs */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Listing Photos</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Add up to 8 photo URLs for your listing.
            </p>
          </div>
          {imageUrls.length < 8 && (
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Add Photo URL
            </button>
          )}
        </div>

        <div className="space-y-2">
          {imageUrls.map((url, idx) => (
            <div key={`edit-img-input-${idx}`} className="flex items-center gap-2">
              <Input
                placeholder="https://images.unsplash.com/... or secure image URL"
                value={url}
                onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                className="text-xs"
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveImageUrl(idx)}
                  className="px-2.5 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-zinc-800">
        <Link
          href="/dashboard"
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </Link>
        <Button type="submit" variant="primary" size="lg" isLoading={isPending}>
          {isPending ? "Saving Changes..." : "Update Listing"}
        </Button>
      </div>
    </form>
  );
};
