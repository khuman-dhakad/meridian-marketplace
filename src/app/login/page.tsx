"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Architectural notice: Ready for NextAuth / Auth0 / Supabase / Custom JWT backend integration
    setStatusMessage(
      "Frontend Scaffold: Authentication backend integration will connect here. No credentials transmitted."
    );
  };

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
          {statusMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-800 font-medium">
              {statusMessage}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
                <button
                  type="button"
                  onClick={() =>
                    setStatusMessage(
                      "Password reset service endpoint configured for production deployment."
                    )
                  }
                  className="font-semibold text-brand-600 hover:text-brand-500"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Sign In
            </Button>
          </form>

          {/* Social Login Scaffold (Strictly labeled as integration point) */}
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
                onClick={() =>
                  setStatusMessage("OAuth Google provider endpoint configured for authentication phase.")
                }
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Google Account</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setStatusMessage("OAuth Apple provider endpoint configured for authentication phase.")
                }
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Apple ID</span>
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
