"use client";

import { useActionState, useState } from "react";
import { creditAccount, debitAccount } from "@/lib/actions/admin";
import { Modal } from "@/components/ui/modal";

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
  const [open, setOpen] = useState(false);

  const totalBalance = user.sub_accounts.reduce((s, sa) => s + Number(sa.balance), 0);

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-xs text-iwb-slate">
          ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        <button
          onClick={() => setOpen(true)}
          className="rounded-iwb-md bg-iwb-navy px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-iwb-navy-light"
        >
          Manage
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={user.full_name}>
        <div className="space-y-4">
          <div className="rounded-iwb-lg bg-iwb-surface p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-iwb-slate-light">Email</p>
                <p className="font-medium text-iwb-navy">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-iwb-slate-light">Account</p>
                <p className="font-mono font-medium text-iwb-navy">{user.account_number}</p>
              </div>
              <div>
                <p className="text-xs text-iwb-slate-light">Joined</p>
                <p className="font-medium text-iwb-navy">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-iwb-slate-light">Total Balance</p>
                <p className="font-semibold text-iwb-navy">
                  ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs font-medium uppercase tracking-wider text-iwb-slate-light">
            Sub-accounts
          </p>

          <div className="space-y-3">
            {user.sub_accounts.map((sa) => (
              <SubAccountCard key={sa.id} subAccount={sa} userName={user.full_name} />
            ))}
            {user.sub_accounts.length === 0 && (
              <p className="text-sm text-iwb-slate">No sub-accounts</p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

function SubAccountCard({
  subAccount,
  userName,
}: {
  subAccount: SubAccount;
  userName: string;
}) {
  const [mode, setMode] = useState<"credit" | "debit" | null>(null);

  if (mode) {
    return (
      <AdminActionForm
        key={`${subAccount.id}-${mode}`}
        subAccountId={subAccount.id}
        subAccountType={subAccount.type}
        balance={Number(subAccount.balance)}
        mode={mode}
        userName={userName}
        onCancel={() => setMode(null)}
      />
    );
  }

  return (
    <div className="flex items-center justify-between rounded-iwb-lg border border-iwb-border-light px-4 py-3 transition-colors hover:bg-iwb-surface">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${
            subAccount.is_default
              ? "bg-iwb-teal/10 text-iwb-teal"
              : "bg-iwb-navy/5 text-iwb-slate"
          }`}
        >
          {subAccount.type === "checking" ? "C" : "S"}
        </span>
        <div>
          <p className="text-sm font-medium capitalize text-iwb-navy">
            {subAccount.type}
            {subAccount.is_default ? (
              <span className="ml-1.5 rounded-iwb-full bg-iwb-teal/10 px-1.5 py-0.5 text-[10px] font-medium text-iwb-teal">
                Default
              </span>
            ) : null}
          </p>
          <p className="text-xs text-iwb-slate">
            ${Number(subAccount.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
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
    <form
      action={formAction}
      className="rounded-iwb-lg border border-iwb-border-light bg-white p-4 shadow-iwb-card"
    >
      <p className="mb-3 text-sm font-medium text-iwb-navy">
        {actionLabel} —{" "}
        <span className="capitalize">{subAccountType}</span>
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-iwb-slate">Current Balance</label>
          <p className="text-lg font-semibold text-iwb-navy">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div>
          <label htmlFor="amount" className="text-xs font-medium text-iwb-slate">
            Amount
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-iwb-slate-light">
              $
            </span>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={mode === "debit" ? balance : undefined}
              placeholder="0.00"
              required
              className="block w-full rounded-iwb-md border border-iwb-border bg-white py-2.5 pl-7 pr-4 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="text-xs font-medium text-iwb-slate">
            Description
          </label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder={mode === "credit" ? "Funding reason" : "Withdrawal reason"}
            className="mt-1 block w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-2.5 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
          />
        </div>

        {state?.error ? (
          <p className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-error/5 px-3 py-2 text-xs text-iwb-error">
            <svg className="size-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
            </svg>
            {state.error}
          </p>
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={pending}
            className={`flex-1 rounded-iwb-md px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              mode === "credit"
                ? "bg-iwb-teal hover:bg-iwb-teal-dark"
                : "bg-iwb-error hover:bg-iwb-error/90"
            }`}
          >
            {pending ? "Processing..." : `${actionLabel} $${subAccountType}`}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-iwb-md px-4 py-2.5 text-sm font-medium text-iwb-slate transition-colors hover:text-iwb-navy"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
