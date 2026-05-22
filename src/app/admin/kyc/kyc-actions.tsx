"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveKyc, rejectKyc } from "@/lib/actions/kyc";
import { useLocale } from "@/i18n/client";

interface KycActionsProps {
  userId: string;
}

export function KycActions({ userId }: KycActionsProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleApprove() {
    setLoading(true);
    setActionError(null);
    const formData = new FormData();
    formData.set("user_id", userId);
    const res = await approveKyc(formData);
    if (res.error) setActionError(res.error);
    setLoading(false);
    router.refresh();
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setLoading(true);
    setActionError(null);
    const formData = new FormData();
    formData.set("user_id", userId);
    formData.set("reason", rejectReason);
    const res = await rejectKyc(formData);
    if (res.error) setActionError(res.error);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="border-t border-iwb-border-light px-5 py-3 bg-iwb-surface">
      {actionError ? (
        <div className="mb-3 rounded-iwb-md bg-iwb-error/5 border border-iwb-error/20 px-3 py-2">
          <p className="text-xs text-iwb-error">{actionError}</p>
        </div>
      ) : null}
      {showReject ? (
        <div className="space-y-3">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t("admin.kyc.rejectReason")}
            rows={2}
            className="w-full rounded-iwb-md border border-iwb-border bg-white px-3 py-2 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-error focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
              className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-error px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-iwb-error/90 disabled:opacity-50"
            >
              {loading ? t("common.loading") : t("admin.kyc.confirmReject")}
            </button>
            <button
              onClick={() => { setShowReject(false); setRejectReason(""); setActionError(null); }}
              className="rounded-iwb-md border border-iwb-border px-4 py-2 text-xs font-semibold text-iwb-slate"
            >
              {t("admin.kyc.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-teal px-4 py-2 text-xs font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:opacity-50"
          >
            <i className="material-icons text-sm">check</i>
            {t("admin.kyc.approve")}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-iwb-md border border-iwb-error/30 px-4 py-2 text-xs font-semibold text-iwb-error transition-all hover:bg-iwb-error/5 disabled:opacity-50"
          >
            <i className="material-icons text-sm">close</i>
            {t("admin.kyc.reject")}
          </button>
        </div>
      )}
    </div>
  );
}
