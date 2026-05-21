"use client";

import { useSearchParams } from "next/navigation";

export function PendingContent() {
  const searchParams = useSearchParams();
  const rejected = searchParams.get("rejected") === "true";

  if (rejected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-iwb-surface px-4">
        <div className="w-full max-w-md rounded-iwb-xl bg-white p-8 text-center shadow-iwb-card">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-iwb-error/10">
            <i className="material-icons text-4xl text-iwb-error">cancel</i>
          </div>
          <h1 className="text-xl font-semibold text-iwb-navy">Account Rejected</h1>
          <p className="mt-2 text-sm text-iwb-slate">
            Unfortunately, your account registration could not be approved at this time.
          </p>
          <p className="mt-4 text-xs text-iwb-slate-light">
            Please contact support for more information.
          </p>
          <div className="mt-6 border-t border-iwb-border-light pt-6 text-xs text-iwb-slate-light space-y-1">
            <p>International Western Bank</p>
            <p>+1 (786) 245-4920</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-iwb-surface px-4">
      <div className="w-full max-w-md rounded-iwb-xl bg-white p-8 text-center shadow-iwb-card">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-iwb-navy">
          <i className="material-icons text-white text-3xl">account_balance</i>
        </div>
        <i className="material-icons text-5xl text-iwb-teal mb-4">how_to_reg</i>
        <h1 className="text-xl font-semibold text-iwb-navy">Registration Submitted</h1>
        <p className="mt-2 text-sm text-iwb-slate">
          Thank you for registering. Your application is being reviewed.
        </p>
        <div className="mt-6 rounded-iwb-lg bg-iwb-surface p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <i className="material-icons text-iwb-teal text-sm">schedule</i>
            <span className="text-iwb-slate">Typical review time: 1-2 business days</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <i className="material-icons text-iwb-teal text-sm">notifications</i>
            <span className="text-iwb-slate">You'll be notified once approved</span>
          </div>
        </div>
        <div className="mt-6 border-t border-iwb-border-light pt-6 text-xs text-iwb-slate-light space-y-1">
          <p>International Western Bank</p>
          <p>249 E Ocean Blvd, Long Beach, CA 90802</p>
          <p>+1 (786) 245-4920</p>
        </div>
      </div>
    </div>
  );
}
