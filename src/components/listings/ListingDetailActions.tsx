"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageSquare,
  Phone,
  Edit,
  Archive,
  Flag,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import {
  toggleFavoriteAction,
  archiveListingAction,
  contactSellerAction,
  reportListingAction,
} from "@/lib/auth/actions";

interface ListingDetailActionsProps {
  listingId: string;
  listingSlug: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  isOwner: boolean;
  initialFavorited: boolean;
  currentUserId?: string;
}

const REPORT_REASONS = [
  { value: "SPAM", label: "Spam or irrelevant advertising" },
  { value: "FRAUD_SCAM", label: "Potential fraud, scam, or counterfeit item" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate or offensive content" },
  { value: "PROHIBITED_ITEM", label: "Prohibited, dangerous, or illegal item" },
  { value: "DUPLICATE", label: "Duplicate or expired listing" },
  { value: "WRONG_CATEGORY", label: "Listed in wrong category" },
  { value: "OTHER", label: "Other issue" },
] as const;

export const ListingDetailActions: React.FC<ListingDetailActionsProps> = ({
  listingId,
  listingSlug,
  sellerName,
  sellerPhone,
  isOwner,
  initialFavorited,
  currentUserId,
}) => {
  const router = useRouter();

  // Favorite state
  const [isFav, setIsFav] = useState(initialFavorited);
  const [isFavLoading, setIsFavLoading] = useState(false);

  // Modals state
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  // Contact form state
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageSuccess, setMessageSuccess] = useState(false);

  // Report form state
  const [reportReason, setReportReason] = useState<string>("SPAM");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Archiving state
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  // Phone display toggle
  const [showPhone, setShowPhone] = useState(false);

  const handleFavoriteToggle = async () => {
    if (!currentUserId) {
      router.push(`/login?callbackUrl=/listing/${listingSlug}`);
      return;
    }

    if (isFavLoading) return;
    setIsFavLoading(true);
    const prev = isFav;
    setIsFav(!prev);

    try {
      const formData = new FormData();
      formData.append("listingId", listingId);
      const res = await toggleFavoriteAction(null, formData);
      if (res.error) {
        setIsFav(prev);
      } else if (res.isFavorited !== undefined) {
        setIsFav(res.isFavorited);
      }
    } catch {
      setIsFav(prev);
    } finally {
      setIsFavLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      router.push(`/login?callbackUrl=/listing/${listingSlug}`);
      return;
    }

    if (!messageText.trim()) {
      setMessageError("Please enter a message.");
      return;
    }

    setIsSendingMessage(true);
    setMessageError(null);

    try {
      const formData = new FormData();
      formData.append("listingId", listingId);
      formData.append("message", messageText.trim());

      const res = await contactSellerAction(null, formData);
      if (res.error) {
        setMessageError(res.error);
      } else {
        setMessageSuccess(true);
        setMessageText("");
        setTimeout(() => {
          setIsContactOpen(false);
          setMessageSuccess(false);
        }, 2000);
      }
    } catch {
      setMessageError("Unable to deliver message at this time.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      router.push(`/login?callbackUrl=/listing/${listingSlug}`);
      return;
    }

    setIsSubmittingReport(true);
    setReportError(null);

    try {
      const formData = new FormData();
      formData.append("listingId", listingId);
      formData.append("reason", reportReason);
      if (reportDescription.trim()) {
        formData.append("description", reportDescription.trim());
      }

      const res = await reportListingAction(null, formData);
      if (res.error) {
        setReportError(res.error);
      } else {
        setReportSuccess(true);
        setTimeout(() => {
          setIsReportOpen(false);
          setReportSuccess(false);
        }, 2000);
      }
    } catch {
      setReportError("Unable to submit report. Please try again.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleArchiveConfirm = async () => {
    setIsArchiving(true);
    setArchiveError(null);

    try {
      const formData = new FormData();
      formData.append("listingId", listingId);
      const res = await archiveListingAction(null, formData);
      if (res.error) {
        setArchiveError(res.error);
      } else {
        setIsArchiveConfirmOpen(false);
        router.push("/dashboard");
      }
    } catch {
      setArchiveError("Failed to archive listing.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* OWNER CONTROLS */}
      {isOwner ? (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Owner Controls
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href={`/dashboard/listings/${listingId}/edit`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Listing</span>
            </Link>
            <Button
              variant="outline"
              onClick={() => setIsArchiveConfirmOpen(true)}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Archive className="w-4 h-4 mr-1.5" />
              <span>Archive</span>
            </Button>
          </div>
        </div>
      ) : (
        /* VISITOR / BUYER ACTIONS */
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full justify-center shadow-md text-base"
            onClick={() => {
              if (!currentUserId) {
                router.push(`/login?callbackUrl=/listing/${listingSlug}`);
              } else {
                setIsContactOpen(true);
              }
            }}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            <span>Message Seller</span>
          </Button>

          {sellerPhone && (
            <div>
              {showPhone ? (
                <a
                  href={`tel:${sellerPhone}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold text-sm hover:bg-emerald-100 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{sellerPhone}</span>
                </a>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-center border-slate-300"
                  onClick={() => setShowPhone(true)}
                >
                  <Phone className="w-4 h-4 mr-2 text-slate-500" />
                  <span>Show Phone Number</span>
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleFavoriteToggle}
              disabled={isFavLoading}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                isFav
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
              <span>{isFav ? "Saved to Favorites" : "Save Listing"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!currentUserId) {
                  router.push(`/login?callbackUrl=/listing/${listingSlug}`);
                } else {
                  setIsReportOpen(true);
                }
              }}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
              title="Report this listing"
              aria-label="Report this listing"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CONTACT SELLER MODAL */}
      <Modal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        title={`Message ${sellerName}`}
        description="Your message will be delivered securely through the Meridian messaging center."
      >
        {messageSuccess ? (
          <div className="py-6 flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
            <h3 className="text-base font-bold text-slate-900">Message Delivered!</h3>
            <p className="text-xs text-slate-500 mt-1">The seller has received your inquiry.</p>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 mt-2">
            {messageError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{messageError}</span>
              </div>
            )}

            <div>
              <label htmlFor="message-text" className="block text-xs font-semibold text-slate-700 mb-1">
                Your Message
              </label>
              <textarea
                id="message-text"
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Hi, is this still available? Can we arrange a time to inspect it?"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsContactOpen(false)}
                disabled={isSendingMessage}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSendingMessage || !messageText.trim()}>
                {isSendingMessage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Message</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* REPORT LISTING MODAL */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Report this listing"
        description="Help keep the Meridian Marketplace safe and trustworthy for everyone."
      >
        {reportSuccess ? (
          <div className="py-6 flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
            <h3 className="text-base font-bold text-slate-900">Report Submitted</h3>
            <p className="text-xs text-slate-500 mt-1">
              Thank you. Our trust and safety team will review this listing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="flex flex-col gap-4 mt-2">
            {reportError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reportError}</span>
              </div>
            )}

            <div>
              <label htmlFor="report-reason" className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for reporting
              </label>
              <select
                id="report-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-hidden"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="report-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                id="report-desc"
                rows={3}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide any relevant context to assist our moderators..."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsReportOpen(false)}
                disabled={isSubmittingReport}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmittingReport}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmittingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Report</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ARCHIVE CONFIRMATION MODAL */}
      <Modal
        isOpen={isArchiveConfirmOpen}
        onClose={() => setIsArchiveConfirmOpen(false)}
        title="Archive this listing?"
        description="Archiving will remove this listing from public search and category views. You can view it anytime in your dashboard."
      >
        <div className="flex flex-col gap-4 mt-2">
          {archiveError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{archiveError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsArchiveConfirmOpen(false)}
              disabled={isArchiving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleArchiveConfirm}
              disabled={isArchiving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isArchiving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Archiving...</span>
                </>
              ) : (
                <span>Archive Listing</span>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
