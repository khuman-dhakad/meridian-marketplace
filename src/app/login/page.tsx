"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Mail, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginAction, ActionResponse } from "@/lib/auth/actions";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    loginAction,
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
          Sign in to your account
        </h1>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-600">
          Or{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-600 hover:text-brand-500 hover:underline"
          >
            create a new verified buyer or seller account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-subtle border border-slate-200/90 sm:rounded-2xl sm:px-10">
          {/* Error Banner */}
          {state?.error && (
            <div
              className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <form className="space-y-5" action={formAction}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              icon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-700">
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <span className="font-semibold text-brand-600 hover:text-brand-500 cursor-pointer">
                  Forgot password?
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isPending}
            >
              {isPending ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          {/* Social Login Scaffold (Clearly labeled future boundary) */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-semibold">
                  OAuth Integration Points
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 bg-slate-50/50 cursor-not-allowed"
                disabled
              >
                <span>Google (Upcoming)</span>
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 bg-slate-50/50 cursor-not-allowed"
                disabled
              >
                <span>Apple ID (Upcoming)</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-bit Encrypted Session Security</span>
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
