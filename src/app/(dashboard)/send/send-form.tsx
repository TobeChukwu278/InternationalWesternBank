"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/i18n/client";
import { useToast } from "@/components/ui/toast";
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
  preferredCurrency: string;
}

export function SendForm({ subAccounts, accountNumber, preferredCurrency }: SendFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const defaultAccount = subAccounts.find((sa) => sa.is_default) ?? subAccounts[0];

  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState>(null);
  const [lastReference, setLastReference] = useState("");

  const [recipientAccountNumber, setRecipientAccountNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientBank, setRecipientBank] = useState("");
  const [fromAccount, setFromAccount] = useState(defaultAccount?.id ?? "");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const { t } = useLocale();

  const selectedSub = subAccounts.find((sa) => sa.id === fromAccount);
  const numAmount = parseFloat(amount) || 0;
  const exceedsBalance = selectedSub ? numAmount > selectedSub.balance : false;
  const canSubmit = recipientAccountNumber.length > 0 && recipientName.length > 0 && recipientBank.length > 0 && numAmount > 0 && !exceedsBalance;

  const handleConfirm = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.set("recipient_account_number", recipientAccountNumber);
    formData.set("recipient_name", recipientName);
    formData.set("recipient_bank", recipientBank);
    formData.set("from_sub_account", fromAccount);
    formData.set("amount", amount);
    formData.set("description", reference || "");
    if (scheduleEnabled && scheduleDate) {
      formData.set("scheduled_date", scheduleDate);
    }

    const res = await sendMoney(formData);

    if (res.success) {
      showToast(t("send.submittedForApproval"), "success");
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
  }, [recipientAccountNumber, recipientName, recipientBank, canSubmit, fromAccount, amount, reference, scheduleEnabled, scheduleDate, showToast, router, t]);

  if (step === "result" && result) {
    return (
      <SendResult
        status={result.status}
        amount={amount}
        recipientName={recipientName}
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
        <h1 className="text-2xl font-semibold text-iwb-navy">{t('send.title')}</h1>
        <p className="mt-1 text-sm text-iwb-slate">
          {t("send.subtitle")}
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="material-icons text-iwb-teal">person</i>
          <h2 className="text-sm font-semibold text-iwb-navy">{t('send.recipient')}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-iwb-slate-light uppercase tracking-wider mb-1.5">
              {t("send.accountNumber")}
            </label>
            <input
              type="text"
              value={recipientAccountNumber}
              onChange={(e) => setRecipientAccountNumber(e.target.value)}
              placeholder="e.g. IWB-123456789"
              className="w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:outline-none focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-iwb-slate-light uppercase tracking-wider mb-1.5">
              {t("send.accountHolderName")}
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:outline-none focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-iwb-slate-light uppercase tracking-wider mb-1.5">
              {t("send.bankName")}
            </label>
            <input
              type="text"
              value={recipientBank}
              onChange={(e) => setRecipientBank(e.target.value)}
              placeholder="e.g. Chase Bank"
              className="w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:outline-none focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 transition-colors"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="material-icons text-iwb-teal">swap_horiz</i>
          <h2 className="text-sm font-semibold text-iwb-navy">{t("send.transferDetails")}</h2>
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
          {t('send.title')}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1 text-xs text-iwb-slate-light">
          <i className="material-icons text-xs">verified_user</i>
          {t("send.encryptedNote")}
        </p>
      </div>

      {step === "confirmation" ? (
        <SendConfirmation
          recipientAccountNumber={recipientAccountNumber}
          recipientName={recipientName}
          recipientBank={recipientBank}
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
