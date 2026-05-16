"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return login(formData);
    },
    null,
  );

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-iwb-navy items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0a2540,_#001020)]" />
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-white/10">
            <span className="text-2xl font-bold text-iwb-teal">IWB</span>
          </div>
          <h2 className="text-3xl font-bold text-white">
            International Western Bank
          </h2>
          <p className="mt-3 text-lg text-iwb-slate-light">
            Secure global banking at your fingertips. Manage your finances
            across borders with confidence.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-iwb-surface px-4 py-12 lg:px-8">
        <Card className="w-full max-w-sm p-8">
          <div className="mb-8 text-center lg:hidden">
            <span className="text-xl font-bold text-iwb-navy">IWB</span>
          </div>

          <h1 className="text-xl font-semibold text-iwb-navy">Welcome back</h1>
          <p className="mt-1 text-sm text-iwb-slate">
            Sign in to your account
          </p>

          <form action={formAction} className="mt-8 space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />

            {state?.error ? (
              <p className="flex items-center gap-1.5 text-sm text-iwb-error">
                <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                    clipRule="evenodd"
                  />
                </svg>
                {state.error}
              </p>
            ) : null}

            <Button type="submit" loading={pending} className="w-full">
              Sign In
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-iwb-slate hover:text-iwb-navy transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-iwb-slate">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-iwb-navy hover:text-iwb-teal transition-colors"
            >
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
