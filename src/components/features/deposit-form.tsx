"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { depositFunds } from "@/lib/actions/deposit";
import { useToast } from "@/components/ui/toast";

interface SubAccount {
  id: string;
  type: string;
  balance: number;
  currency: string;
  is_default: boolean;
}

export function DepositForm({ subAccounts }: { subAccounts: SubAccount[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedSubId, setSelectedSubId] = useState(
    subAccounts.find((sa) => sa.is_default)?.id ?? subAccounts[0]?.id ?? "",
  );
  const [amount, setAmount] = useState("");

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await depositFunds(formData);
      if (result.success) {
        showToast(`Deposited $${parseFloat(amount).toFixed(2)} successfully`, "success");
        setAmount("");
        return { success: true };
      }
      return result;
    },
    null,
  );

  const selectedSub = subAccounts.find((sa) => sa.id === selectedSubId);
  const amountNum = parseFloat(amount);
  const canSubmit = !isNaN(amountNum) && amountNum > 0;

  return (
    <Card className="w-full max-w-lg p-6">
      <h2 className="text-lg font-semibold text-iwb-navy">Deposit Funds</h2>
      <p className="mt-1 text-sm text-iwb-slate">Add money to your account</p>

      <form action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="sub_account_id" value={selectedSubId} />

        <div>
          <label className="text-sm font-medium text-iwb-navy">Deposit to</label>
          <select
            value={selectedSubId}
            onChange={(e) => setSelectedSubId(e.target.value)}
            className="mt-1.5 block w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
          >
            {subAccounts.map((sa) => (
              <option key={sa.id} value={sa.id}>
                {sa.type.charAt(0).toUpperCase() + sa.type.slice(1)} — ${Number(sa.balance).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Amount (USD)"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <Input
          label="Description (optional)"
          name="description"
          type="text"
          placeholder="e.g. Birthday money, Freelance payment"
        />

        {state?.error ? (
          <p className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-error/5 px-3 py-2 text-sm text-iwb-error">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" loading={pending} disabled={!canSubmit} className="w-full">
          {pending ? "Processing..." : `Deposit $${amountNum > 0 ? amountNum.toFixed(2) : "0.00"}`}
        </Button>
      </form>
    </Card>
  );
}
