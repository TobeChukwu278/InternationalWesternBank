"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveTransfer, rejectTransfer } from "@/lib/actions/transfer";

interface TransferActionsProps {
  transactionId: string;
}

export function TransferActions({ transactionId }: TransferActionsProps) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    const formData = new FormData();
    formData.set("transaction_id", transactionId);
    const res = await approveTransfer(formData);
    if (res.success) router.refresh();
    setLoading(false);
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setLoading(true);
    const formData = new FormData();
    formData.set("transaction_id", transactionId);
    formData.set("reason", rejectReason);
    const res = await rejectTransfer(formData);
    if (res.success) router.refresh();
    setLoading(false);
  }

  return (
    <div className="border-t border-iwb-border-light px-5 py-3 bg-iwb-surface">
      {showReject ? (
        <div className="space-y-3">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={2}
            className="w-full rounded-iwb-md border border-iwb-border bg-white px-3 py-2 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-error focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
              className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-error px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-iwb-error/90 disabled:opacity-50"
            >
              {loading ? "..." : "Confirm Reject"}
            </button>
            <button
              onClick={() => { setShowReject(false); setRejectReason(""); }}
              className="rounded-iwb-md border border-iwb-border px-4 py-2 text-xs font-semibold text-iwb-slate"
            >
              Cancel
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
            {loading ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-iwb-md border border-iwb-error/30 px-4 py-2 text-xs font-semibold text-iwb-error transition-all hover:bg-iwb-error/5 disabled:opacity-50"
          >
            <i className="material-icons text-sm">close</i>
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
