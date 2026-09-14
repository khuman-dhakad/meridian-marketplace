"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  MapPin,
  FileText,
  DollarSign,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { CATEGORIES } from "@/lib/data/categories";
import { LOCATIONS } from "@/lib/data/locations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createListingAction, ActionResponse } from "@/lib/auth/actions";

export default function PostAdPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [category, setCategory] = useState(CATEGORIES[0].slug);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "hourly" | "free">("fixed");
  const [condition, setCondition] = useState("GOOD");
  const [location, setLocation] = useState(LOCATIONS[0].slug);
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    createListingAction,
    null
  );

  const selectedCatObj = CATEGORIES.find((c) => c.slug === category);

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

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Post a Classified Ad</span>
        </div>

        {/* Wizard Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-300 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Listing Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Create Your Marketplace Ad
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Reach genuine local buyers. Real database storage bound to your authenticated profile.
            </p>

            {/* Stepper Indicator */}
            <div className="mt-6 flex items-center justify-between text-xs text-slate-300 max-w-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= 1 ? "bg-brand-600 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                >
                  1
                </span>
                <span className={currentStep === 1 ? "font-bold text-white" : ""}>Details</span>
              </div>
              <div className="w-8 h-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= 2 ? "bg-brand-600 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                >
                  2
                </span>
                <span className={currentStep === 2 ? "font-bold text-white" : ""}>Pricing</span>
              </div>
              <div className="w-8 h-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= 3 ? "bg-brand-600 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                >
                  3
                </span>
                <span className={currentStep === 3 ? "font-bold text-white" : ""}>Media &amp; Review</span>
              </div>
            </div>
          </div>

          {/* Form / Wizard Body */}
          <div className="p-6 sm:p-8">
            {/* Top Error Notice if submission failed */}
            {state?.error && (
              <div
                className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start gap-2"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Submission Error</p>
                  <p>{state.error}</p>
                </div>
              </div>
            )}

            {state?.success ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Ad Saved Successfully!
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for posting with Meridian. Your listing &quot;{title}&quot; has been recorded in the database and associated with your account.
                </p>
                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  {state.listingSlug && (
                    <Link
                      href={`/listing/${state.listingSlug}`}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
                    >
                      View Published Listing &rarr;
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    View in Dashboard
                  </Link>
                  <Link
                    href="/"
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <form action={formAction} className="space-y-6">
                {/* Hidden fields so entire wizard state submits together */}
                <input type="hidden" name="categorySlug" value={category} />
                <input type="hidden" name="title" value={title} />
                <input type="hidden" name="description" value={description} />
                <input type="hidden" name="price" value={price} />
                <input type="hidden" name="priceType" value={priceType} />
                <input type="hidden" name="condition" value={condition} />
                <input type="hidden" name="locationSlug" value={location} />
                <input type="hidden" name="contactPhone" value={contactPhone} />
                <input type="hidden" name="isNegotiable" value={String(isNegotiable)} />
                {validImages.map((url, idx) => (
                  <input key={`img-hidden-${idx}`} type="hidden" name="images" value={url} />
                ))}

                {/* Step 1: Category & Details */}
                {currentStep === 1 && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <h2 className="text-lg font-bold text-slate-900">Step 1: Category &amp; Basics</h2>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Primary Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-sm font-medium rounded-lg border border-slate-300 py-2.5 px-3.5 bg-white focus:outline-hidden focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Ad Title"
                      placeholder="e.g. 2022 Tesla Model 3 Long Range or Solid Walnut Dining Table"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      error={state?.fieldErrors?.title?.[0]}
                      icon={<FileText className="w-4 h-4" />}
                    />

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Item Condition
                      </label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full text-sm font-medium rounded-lg border border-slate-300 py-2.5 px-3.5 bg-white focus:outline-hidden focus:border-brand-600"
                      >
                        <option value="NEW_CONDITION">Brand New (Unopened / In original box)</option>
                        <option value="LIKE_NEW">Like New (Mint condition, lightly used)</option>
                        <option value="EXCELLENT">Excellent (Minimal signs of wear)</option>
                        <option value="GOOD">Good (Normal wear, fully functional)</option>
                        <option value="FAIR">Fair (Visible wear, works as intended)</option>
                        <option value="FOR_PARTS">For Parts / Not Working</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Detailed Description
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Provide clear specifications, condition, maintenance history, reason for selling, and pickup details..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full text-sm rounded-lg border border-slate-300 p-3 bg-white focus:outline-hidden focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                      />
                      {state?.fieldErrors?.description?.[0] && (
                        <p className="text-xs text-rose-600 mt-1">
                          {state.fieldErrors.description[0]}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                          if (title.trim()) setCurrentStep(2);
                        }}
                      >
                        Continue to Pricing &amp; Region &rarr;
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Pricing & Location */}
                {currentStep === 2 && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <h2 className="text-lg font-bold text-slate-900">Step 2: Pricing &amp; Location</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Price ($ USD)"
                        type="number"
                        placeholder="e.g. 2500"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        error={state?.fieldErrors?.price?.[0]}
                        icon={<DollarSign className="w-4 h-4" />}
                      />

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Price Structure
                        </label>
                        <select
                          value={priceType}
                          onChange={(e) => setPriceType(e.target.value as "fixed" | "hourly" | "free")}
                          className="w-full text-sm font-medium rounded-lg border border-slate-300 py-2.5 px-3.5 bg-white focus:outline-hidden focus:border-brand-600"
                        >
                          <option value="fixed">Fixed Price</option>
                          <option value="hourly">Hourly Rate (Services)</option>
                          <option value="free">Free / Give Away</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Marketplace Metro Region
                      </label>
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full text-sm font-medium rounded-lg border border-slate-300 py-2.5 px-3.5 bg-white focus:outline-hidden focus:border-brand-600"
                      >
                        {LOCATIONS.map((l) => (
                          <option key={l.id} value={l.slug}>
                            {l.name} ({l.state})
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Contact Phone (Optional - Relay Protected)"
                      type="tel"
                      placeholder="e.g. (555) 019-2834"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />

                    <div className="flex items-center gap-2">
                      <input
                        id="negotiable"
                        type="checkbox"
                        checked={isNegotiable}
                        onChange={(e) => setIsNegotiable(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <label htmlFor="negotiable" className="text-xs font-medium text-slate-700">
                        Price is negotiable (OBO)
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setCurrentStep(1)}
                      >
                        &larr; Back
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setCurrentStep(3)}
                      >
                        Media &amp; Review &rarr;
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Media & Review */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    <h2 className="text-lg font-bold text-slate-900">Step 3: Media &amp; Publish</h2>

                    {/* Image URL Manager (up to 8 images) */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Listing Photos</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
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
                          <div key={`img-input-${idx}`} className="flex items-center gap-2">
                            <Input
                              placeholder="https://images.unsplash.com/... or secure photo URL"
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

                    {/* Summary Preview Box */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Category:</span>
                        <span className="font-semibold text-slate-800">{selectedCatObj?.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Condition:</span>
                        <span className="font-semibold text-slate-800">{condition.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Listing Title:</span>
                        <span className="font-semibold text-slate-800 max-w-xs truncate">{title}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Price:</span>
                        <span className="font-semibold text-emerald-700 font-mono">
                          ${price || "0"} ({priceType}) {isNegotiable ? "• OBO" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Region:</span>
                        <span className="font-semibold text-slate-800">{location}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Description:</span>
                        <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                          {description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setCurrentStep(2)}
                      >
                        &larr; Back to Pricing
                      </Button>
                      <Button type="submit" variant="primary" size="lg" isLoading={isPending}>
                        {isPending ? "Saving Listing..." : "Publish Listing"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
