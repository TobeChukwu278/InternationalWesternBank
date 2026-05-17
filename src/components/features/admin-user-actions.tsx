"use client";

import { useActionState, useState } from "react";
import { creditAccount, debitAccount } from "@/lib/actions/admin";

interface SubAccount {
  id: string;
  type: string;
  balance: number;
  currency: string;
  is_default: boolean;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  account_number: string;
  sub_accounts: SubAccount[];
}

export function AdminUserActions({ user }: { user: User }) {
  return (
    <div className="space-y-3">
      {user.sub_accounts.map((sa) => (
        <CreditDebitForm key={sa.id} subAccount={sa} userName={user.full_name} />
      ))}
    </div>
  );
}

function CreditDebitForm({
  subAccount,
  userName,
}: {
  subAccount: SubAccount;
  userName: string;
}) {
  const [mode, setMode] = useState<"credit" | "debit" | null>(null);

  if (!mode) {
    return (
      <div className="flex items-center justify-between rounded-iwb-md border border-iwb-border-light px-4 py-2.5">
        <div>
          <span className="text-sm font-medium text-iwb-navy capitalize">{subAccount.type}</span>
          <span className="ml-2 text-sm text-iwb-slate">${Number(subAccount.balance).toFixed(2)}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setMode("credit")}
            className="rounded-iwb-md bg-iwb-teal/10 px-3 py-1.5 text-xs font-semibold text-iwb-teal transition-colors hover:bg-iwb-teal/20"
          >
            Credit
          </button>
          <button
            onClick={() => setMode("debit")}
            className="rounded-iwb-md bg-iwb-error/10 px-3 py-1.5 text-xs font-semibold text-iwb-error transition-colors hover:bg-iwb-error/20"
          >
            Debit
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminActionForm
      subAccountId={subAccount.id}
      subAccountType={subAccount.type}
      balance={Number(subAccount.balance)}
      mode={mode}
      userName={userName}
      onCancel={() => setMode(null)}
    />
  );
}

function AdminActionForm({
  subAccountId,
  subAccountType,
  balance,
  mode,
  userName,
  onCancel,
}: {
  subAccountId: string;
  subAccountType: string;
  balance: number;
  mode: "credit" | "debit";
  userName: string;
  onCancel: () => void;
}) {
  const action = mode === "credit" ? creditAccount : debitAccount;
  const actionLabel = mode === "credit" ? "Credit" : "Debit";

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      formData.set("sub_account_id", subAccountId);
      const result = await action(formData);
      if (result.success) {
        onCancel();
        return null;
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="rounded-iwb-md border border-iwb-border-light bg-iwb-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-iwb-navy">
          {actionLabel} {subAccountType} — {userName}
        </p>
        <span className="text-xs text-iwb-slate">Balance: ${balance.toFixed(2)}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-iwb-slate">$</span>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          max={mode === "debit" ? balance : undefined}
          placeholder="0.00"
          required
          className="block w-full rounded-iwb-md border border-iwb-border bg-white px-3 py-1.5 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
        />
        <input
          name="description"
          type="text"
          placeholder="Reason..."
          className="block w-full rounded-iwb-md border border-iwb-border bg-white px-3 py-1.5 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className={`rounded-iwb-md px-4 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 ${
            mode === "credit"
              ? "bg-iwb-teal hover:bg-iwb-teal-dark"
              : "bg-iwb-error hover:bg-iwb-error/90"
          }`}
        >
          {pending ? "..." : actionLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-iwb-md px-3 py-1.5 text-xs font-medium text-iwb-slate transition-colors hover:text-iwb-navy"
        >
          Cancel
        </button>
      </div>

      {state?.error ? (
        <p className="mt-1.5 text-xs text-iwb-error">{state.error}</p>
      ) : null}
    </form>
  );
}
