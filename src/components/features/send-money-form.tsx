"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RecipientSearch } from "@/components/features/recipient-search";
import { sendMoney } from "@/lib/actions/transfer";
import { useRouter } from "next/navigation";

interface SubAccount {
  id: string;
  type: string;
  balance: number;
  currency: string;
  is_default: boolean;
}

interface SendMoneyFormProps {
  subAccounts: SubAccount[];
}

export function SendMoneyForm({ subAccounts }: SendMoneyFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await sendMoney(formData);
      if (result.success) {
        router.push("/dashboard");
        return null;
      }
      return result;
    },
    null,
  );

  const defaultSubAccount = subAccounts.find((sa) => sa.is_default) ?? subAccounts[0];

  return (
    <Card className="max-w-lg p-6">
      <h2 className="text-lg font-semibold text-iwb-navy">Send Money</h2>
      <p className="mt-1 text-sm text-iwb-slate">Transfer funds to another account</p>

      <form action={formAction} className="mt-6 space-y-5">
        <RecipientSearch
          onSelect={() => {}}
        />

        <div>
          <label className="text-sm font-medium text-iwb-navy">From</label>
          <select
            name="from_sub_account"
            defaultValue={defaultSubAccount?.id}
            className="mt-1.5 block w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
          >
            {subAccounts.map((sa) => (
              <option key={sa.id} value={sa.id}>
                {sa.type.charAt(0).toUpperCase() + sa.type.slice(1)} — ${sa.balance.toFixed(2)}
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
          required
        />

        <Input
          label="Description (optional)"
          name="description"
          type="text"
          placeholder="What's this for?"
        />

        {state?.error ? (
          <p className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-error/5 px-3 py-2 text-sm text-iwb-error">
            <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
            </svg>
            {state.error}
          </p>
        ) : null}

        <Button type="submit" loading={pending} className="w-full">
          Send Money
        </Button>
      </form>
    </Card>
  );
}
