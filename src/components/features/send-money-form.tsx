"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { RecipientSearch } from "@/components/features/recipient-search";
import { sendMoney } from "@/lib/actions/transfer";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

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
  const { showToast } = useToast();
  const [selectedSubId, setSelectedSubId] = useState(
    subAccounts.find((sa) => sa.is_default)?.id ?? subAccounts[0]?.id ?? "",
  );
  const [amount, setAmount] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<{ accountNumber: string; fullName: string } | null>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await sendMoney(formData);
      if (result.success) {
        const amt = parseFloat(formData.get("amount") as string);
        showToast(
          `Sent $${amt.toFixed(2)} successfully`,
          "success",
        );
        router.push("/dashboard");
        return null;
      }
      return result;
    },
    null,
  );

  const selectedSub = subAccounts.find((sa) => sa.id === selectedSubId);
  const amountNum = parseFloat(amount);
  const exceedsBalance = !isNaN(amountNum) && selectedSub && amountNum > selectedSub.balance;
  const canSubmit = !exceedsBalance && amountNum > 0;

  return (
    <Card className="w-full max-w-lg p-6">
      <h2 className="text-lg font-semibold text-iwb-navy">Send Money</h2>
      <p className="mt-1 text-sm text-iwb-slate">Transfer funds to another account</p>

      <form action={formAction} className="mt-6 space-y-5">
        <RecipientSearch recentRecipients={[]} selected={selectedRecipient} onSelect={setSelectedRecipient} />

        <Select
          label="From"
          name="from_sub_account"
          value={selectedSubId}
          onChange={(e) => setSelectedSubId(e.target.value)}
        >
          {subAccounts.map((sa) => (
            <option key={sa.id} value={sa.id}>
              {sa.type.charAt(0).toUpperCase() + sa.type.slice(1)} — ${sa.balance.toFixed(2)}
            </option>
          ))}
        </Select>

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

        {exceedsBalance && (
          <p className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-error/5 px-3 py-2 text-sm text-iwb-error">
            <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
            </svg>
            Amount exceeds your available balance of ${selectedSub?.balance.toFixed(2)}
          </p>
        )}

        {state?.error ? (
          <p className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-error/5 px-3 py-2 text-sm text-iwb-error">
            <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
            </svg>
            {state.error}
          </p>
        ) : null}

        <Button type="submit" loading={pending} disabled={!canSubmit} className="w-full">
          {exceedsBalance ? "Insufficient Balance" : "Send Money"}
        </Button>
      </form>
    </Card>
  );
}
