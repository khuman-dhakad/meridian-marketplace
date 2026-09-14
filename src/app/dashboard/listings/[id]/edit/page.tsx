import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getListingById } from "@/lib/data/repository";
import { Role } from "@prisma/client";
import { EditListingForm } from "./EditListingForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Listing | Meridian Marketplace",
  description: "Modify your classified listing specifications and details.",
};

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/login?callbackUrl=/dashboard/listings/${id}/edit`);
  }

  // Load listing with visibility and ownership verification
  const listing = await getListingById(id, session.id, session.role);

  if (!listing) {
    notFound();
  }

  // Double-check ownership: seller or ADMIN
  if (listing.seller.id !== session.id && session.role !== Role.ADMIN) {
    notFound();
  }

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <Link
            href="/dashboard"
            className="hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">Edit Listing</span>
        </div>

        {/* Container */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-subtle overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-300 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Owner Authorized Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Edit Classified Listing
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Update pricing, specifications, description, or photos for &quot;{listing.title}&quot;.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <EditListingForm listing={listing} />
          </div>
        </div>
      </div>
    </div>
  );
}
