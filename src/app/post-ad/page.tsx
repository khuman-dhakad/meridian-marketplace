"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { CATEGORIES } from "@/lib/data/categories";
import { LOCATIONS } from "@/lib/data/locations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function PostAdPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [category, setCategory] = useState(CATEGORIES[0].slug);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "hourly" | "free">("fixed");
  const [location, setLocation] = useState(LOCATIONS[0].slug);
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const selectedCatObj = CATEGORIES.find((c) => c.slug === category);

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
              Reach genuine local buyers. Free basic ad placement with instant neighborhood indexing.
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
                <span className={currentStep === 3 ? "font-bold text-white" : ""}>Review</span>
              </div>
            </div>
          </div>

          {/* Form / Wizard Body */}
          <div className="p-6 sm:p-8">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Ad Submitted for Moderation!
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for posting with Meridian. Your listing &quot;{title}&quot; is currently undergoing
                  standard automated verification check before public display.
                </p>
                <div className="pt-4 flex justify-center gap-3">
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
              <form onSubmit={handleSubmit} className="space-y-6">
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
                        className="w-full text-sm font-medium rounded-lg border border-slate-300 py-2.5 px-3.5 bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
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
                      icon={<FileText className="w-4 h-4" />}
                    />

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
                        className="w-full text-sm rounded-lg border border-slate-300 p-3 bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                      />
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
                        icon={<DollarSign className="w-4 h-4" />}
                      />

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Price Structure
                        </label>
                        <select
                          value={priceType}
                          onChange={(e) => setPriceType(e.target.value as any)}
                          className="w-full text-sm font-medium rounded-lg border border-slate-300 py-2.5 px-3.5 bg-white focus:outline-none focus:border-brand-600"
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
                        className="w-full text-sm font-medium rounded-lg border border-slate-300 py-2.5 px-3.5 bg-white focus:outline-none focus:border-brand-600"
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
                        Review Listing &rarr;
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    <h2 className="text-lg font-bold text-slate-900">Step 3: Review &amp; Publish</h2>

                    {/* Summary Preview Box */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Category:</span>
                        <span className="font-semibold text-slate-800">{selectedCatObj?.name}</span>
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

                    {/* Media Upload Mock Container */}
                    <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        Listing Image Storage Pipeline
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Images are automatically compressed and secured upon database persistence.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setCurrentStep(2)}
                      >
                        &larr; Back to Pricing
                      </Button>
                      <Button type="submit" variant="primary" size="lg">
                        Submit Listing for Verification
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
