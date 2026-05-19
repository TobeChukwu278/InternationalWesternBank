"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { RecipientSearch } from "@/components/features/recipient-search";
import { sendMoney } from "@/lib/actions/transfer";
import { TransferDetails } from "./transfer-details";
import { ScheduleToggle } from "./schedule-toggle";
import { SendConfirmation } from "./send-confirmation";
import { SendResult } from "./send-result";

type Step = "form" | "confirmation" | "result";
type ResultState = {
  status: "success" | "failure" | "pending";
  error?: string;
} | null;

interface SubAccountOption {
  id: string;
  type: string;
  balance: number;
  is_default: boolean;
}

interface SendFormProps {
  subAccounts: SubAccountOption[];
  accountNumber: string;
  recentRecipients: { account_number: string; full_name: string }[];
  preferredCurrency: string;
}

export function SendForm({ subAccounts, accountNumber, recentRecipients, preferredCurrency }: SendFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const defaultAccount = subAccounts.find((sa) => sa.is_default) ?? subAccounts[0];

  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState>(null);
  const [lastReference, setLastReference] = useState("");

  const [recipient, setRecipient] = useState<{ accountNumber: string; fullName: string } | null>(null);
  const [fromAccount, setFromAccount] = useState(defaultAccount?.id ?? "");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const selectedSub = subAccounts.find((sa) => sa.id === fromAccount);
  const numAmount = parseFloat(amount) || 0;
  const exceedsBalance = selectedSub ? numAmount > selectedSub.balance : false;
  const canSubmit = recipient?.accountNumber && numAmount > 0 && !exceedsBalance;

  const handleConfirm = useCallback(async () => {
    if (!recipient || !canSubmit) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.set("recipient", recipient.accountNumber);
    formData.set("from_sub_account", fromAccount);
    formData.set("amount", amount);
    formData.set("description", reference || "");
    if (scheduleEnabled && scheduleDate) {
      formData.set("scheduled_date", scheduleDate);
    }

    const res = await sendMoney(formData);

    if (res.success) {
      showToast("Money sent successfully", "success");
      setLastReference(res.reference ?? "");
      setResult({
        status: (res.status as "success" | "pending") ?? "success",
      });
      setStep("result");
      router.refresh();
    } else {
      setResult({ status: "failure", error: res.error });
      setStep("result");
    }

    setSubmitting(false);
  }, [recipient, canSubmit, fromAccount, amount, reference, scheduleEnabled, scheduleDate, showToast, router]);

  if (step === "result" && result) {
    return (
      <SendResult
        status={result.status}
        amount={amount}
        recipientName={recipient?.fullName ?? ""}
        reference={lastReference}
        error={result.error ?? undefined}
        scheduledDate={scheduleEnabled ? scheduleDate : undefined}
        preferredCurrency={preferredCurrency}
        onRetry={() => setStep("form")}
        onClose={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Send Money</h1>
        <p className="mt-1 text-sm text-iwb-slate">
          Move funds securely across your global accounts and contacts.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="material-icons text-iwb-teal">person</i>
          <h2 className="text-sm font-semibold text-iwb-navy">Select Recipient</h2>
        </div>
        <RecipientSearch
          recentRecipients={recentRecipients}
          onSelect={setRecipient}
          selected={recipient}
        />
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="material-icons text-iwb-teal">swap_horiz</i>
          <h2 className="text-sm font-semibold text-iwb-navy">Transfer Details</h2>
        </div>
        <TransferDetails
          subAccounts={subAccounts}
          fromAccount={fromAccount}
          onFromAccountChange={setFromAccount}
          amount={amount}
          onAmountChange={setAmount}
          reference={reference}
          onReferenceChange={setReference}
          exceedsBalance={exceedsBalance}
          preferredCurrency={preferredCurrency}
        />
      </Card>

      <Card className="p-4">
        <ScheduleToggle
          enabled={scheduleEnabled}
          onToggle={setScheduleEnabled}
          date={scheduleDate}
          onDateChange={setScheduleDate}
        />
      </Card>

      <div className="text-center">
        <button
          onClick={() => setStep("confirmation")}
          disabled={!canSubmit}
          className="w-full rounded-iwb-md bg-iwb-teal px-6 py-3.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send Money
        </button>
        <p className="mt-3 flex items-center justify-center gap-1 text-xs text-iwb-slate-light">
          <i className="material-icons text-xs">verified_user</i>
          Encrypted 256-bit secure transfer
        </p>
      </div>

      {step === "confirmation" ? (
        <SendConfirmation
          recipientName={recipient?.fullName ?? ""}
          recipientAccount={recipient?.accountNumber ?? ""}
          fromAccountName={selectedSub?.type ? (selectedSub.type.charAt(0).toUpperCase() + selectedSub.type.slice(1)) : ""}
          amount={amount}
          reference={reference}
          preferredCurrency={preferredCurrency}
          onConfirm={handleConfirm}
          onCancel={() => setStep("form")}
          loading={submitting}
        />
      ) : null}
    </div>
  );
}
