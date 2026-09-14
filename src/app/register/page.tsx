"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User, Building, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerAction, ActionResponse } from "@/lib/auth/actions";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<"personal" | "business">("personal");

  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    registerAction,
    null
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-brand-600 font-extrabold text-2xl tracking-tight"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              M
            </div>
            <span className="text-slate-900">MERIDIAN</span>
          </Link>
        </div>
        <h1 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Create your marketplace account
        </h1>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-600">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:text-brand-500 hover:underline"
          >
            Sign in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-subtle border border-slate-200/90 sm:rounded-2xl sm:px-10">
          {/* Top Error Alert */}
          {state?.error && (
            <div
              className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Account Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setAccountType("personal")}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                accountType === "personal"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Individual Buyer / Seller
            </button>
            <button
              type="button"
              onClick={() => setAccountType("business")}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                accountType === "business"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Dealer / Pro Business
            </button>
          </div>

          <form className="space-y-4" action={formAction}>
            <input type="hidden" name="accountType" value={accountType} />

            <Input
              label={accountType === "personal" ? "Full Name" : "Contact Representative Name"}
              name="name"
              type="text"
              placeholder={accountType === "personal" ? "Jane Doe" : "Alex Miller"}
              required
              autoComplete="name"
              error={state?.fieldErrors?.name?.[0]}
              icon={<User className="w-4 h-4" />}
            />

            {accountType === "business" && (
              <Input
                label="Business / Dealership Name"
                name="businessName"
                type="text"
                placeholder="e.g. Apex Motors LLC"
                required
                error={state?.fieldErrors?.businessName?.[0]}
                icon={<Building className="w-4 h-4" />}
              />
            )}

            <Input
              label="Work or Personal Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              error={state?.fieldErrors?.email?.[0]}
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Create Strong Password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters (letters & numbers)"
              required
              autoComplete="new-password"
              error={state?.fieldErrors?.password?.[0]}
              icon={<Lock className="w-4 h-4" />}
            />

            <div className="text-xs text-slate-500 space-y-2 pt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>
                  I agree to the Meridian Community Standards, Privacy Policy, and Anti-Fraud Guidelines.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isPending}
            >
              {isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Anti-Spam &amp; Secure Verification Guard</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
