"use client";

import { useRouter } from "next/navigation";
import { confirmDeposit, rejectDeposit } from "@/lib/actions/deposit";
import { useLocale } from "@/i18n/client";

interface DepositActionsProps {
  transactionId: string;
}

export function DepositActions({ transactionId }: DepositActionsProps) {
  const { t } = useLocale();
  const router = useRouter();

  async function handleConfirm() {
    const formData = new FormData();
    formData.set("transaction_id", transactionId);
    const res = await confirmDeposit(formData);
    if (res.success) router.refresh();
  }

  async function handleReject() {
    const formData = new FormData();
    formData.set("transaction_id", transactionId);
    const res = await rejectDeposit(formData);
    if (res.success) router.refresh();
  }

  return (
    <div className="flex gap-2 border-t border-iwb-border-light px-5 py-3 bg-iwb-surface">
      <button
        onClick={handleConfirm}
        className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-teal px-4 py-2 text-xs font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark"
      >
        <i className="material-icons text-sm">check</i>
        {t("admin.deposits.confirmLabel")}
      </button>
      <button
        onClick={handleReject}
        className="flex items-center gap-1.5 rounded-iwb-md border border-iwb-error/30 px-4 py-2 text-xs font-semibold text-iwb-error transition-all hover:bg-iwb-error/5"
      >
        <i className="material-icons text-sm">close</i>
        {t("admin.deposits.rejectLabel")}
      </button>
    </div>
  );
}
