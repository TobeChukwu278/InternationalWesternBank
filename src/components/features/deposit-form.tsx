"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { depositFunds } from "@/lib/actions/deposit";
import { useLocale } from "@/i18n/client";

interface SubAccount {
  id: string;
  type: string;
  balance: number;
  currency: string;
  is_default: boolean;
}

interface DepositFormProps {
  subAccounts: SubAccount[];
  preferredCurrency: string;
}

const QUICK_AMOUNTS = [100, 500, 1000];

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

type Step = "form" | "result";
type ResultState = {
  status: "pending" | "failure";
  reference?: string;
  error?: string;
} | null;

export function DepositForm({ subAccounts, preferredCurrency }: DepositFormProps) {
  const router = useRouter();
  const symbol = currencySymbols[preferredCurrency] ?? "$";

  const { t } = useLocale();
  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState>(null);

  const [selectedSubId, setSelectedSubId] = useState(
    subAccounts.find((sa) => sa.is_default)?.id ?? subAccounts[0]?.id ?? "",
  );
  const [amount, setAmount] = useState("");
  const [externalBank, setExternalBank] = useState("");
  const [description, setDescription] = useState("");

  const amountNum = parseFloat(amount);
  const canSubmit = !isNaN(amountNum) && amountNum > 0 && externalBank.trim().length > 0;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.set("sub_account_id", selectedSubId);
    formData.set("amount", amount);
    formData.set("external_bank", externalBank);
    formData.set("description", description);

    const res = await depositFunds(formData);

    if (res.success) {
      setResult({ status: "pending", reference: res.reference });
      setStep("result");
      router.refresh();
    } else {
      setResult({ status: "failure", error: res.error });
      setStep("result");
    }

    setSubmitting(false);
  }, [canSubmit, selectedSubId, amount, externalBank, description, router]);

  function addQuickAmount(val: number) {
    setAmount(String((parseFloat(amount) || 0) + val));
  }

  if (step === "result" && result) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="rounded-iwb-xl border-2 border-iwb-border bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center">
            <img src="/logo.png" alt="IWB" className="size-14" />
          </div>

          {result.status === "pending" ? (
            <>
              <i className="material-icons text-5xl text-iwb-slate mb-3">schedule</i>
              <h2 className="text-lg font-semibold text-iwb-navy mb-1">{t('deposit.success')}</h2>
              <p className="text-3xl font-bold text-iwb-navy mt-4">
                {symbol}{amountNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              {result.reference ? (
                <p className="mt-4 text-xs text-iwb-slate-light">
                  Reference: <span className="font-mono text-iwb-navy">{result.reference}</span>
                </p>
              ) : null}
              <div className="mt-4 rounded-iwb-lg bg-iwb-surface p-4">
                <p className="text-sm text-iwb-slate">
                  {t('deposit.pending')}
                </p>
              </div>
            </>
          ) : result.status === "failure" ? (
            <>
              <i className="material-icons text-5xl text-iwb-error mb-3">cancel</i>
              <h2 className="text-lg font-semibold text-iwb-error mb-1">{t('deposit.failed')}</h2>
              {result.error ? (
                <div className="mt-4 rounded-iwb-lg bg-iwb-error/5 border border-iwb-error/20 p-4">
                  <p className="text-sm text-iwb-error">{result.error}</p>
                </div>
              ) : null}
            </>
          ) : null}

          <div className="mt-6 flex gap-3">
            {result.status === "failure" ? (
              <button
                onClick={() => setStep("form")}
                className="flex-1 rounded-iwb-md bg-iwb-teal px-4 py-2.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark"
              >
                {t('common.retry')}
              </button>
            ) : null}
            <Link
              href="/dashboard"
              className="flex-1 rounded-iwb-md border-2 border-iwb-border px-4 py-2.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface text-center"
            >
              {t('common.back')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* IWB Account Details */}
      <Card className="p-6 border-l-4 border-l-iwb-teal">
        <div className="flex items-center gap-2 mb-4">
          <i className="material-icons text-iwb-teal">account_balance</i>
          <h2 className="text-sm font-semibold text-iwb-navy">{t('deposit.bankTransferInstructions')}</h2>
        </div>
        <p className="text-xs text-iwb-slate mb-4">
          {t('deposit.instructions')}
        </p>
        <div className="space-y-3">
          <div className="flex justify-between border-b border-iwb-border-light pb-2">
            <span className="text-xs text-iwb-slate-light">{t('deposit.bank')}</span>
            <span className="text-sm font-medium text-iwb-navy">International Western Bank</span>
          </div>
          <div className="flex justify-between border-b border-iwb-border-light pb-2">
            <span className="text-xs text-iwb-slate-light">{t('deposit.accountName')}</span>
            <span className="text-sm font-medium text-iwb-navy">IWB Customer Deposits</span>
          </div>
          <div className="flex justify-between border-b border-iwb-border-light pb-2">
            <span className="text-xs text-iwb-slate-light">{t('deposit.accountNumber')}</span>
            <span className="text-sm font-mono font-medium text-iwb-navy">4829-1023-7756-0184</span>
          </div>
          <div className="flex justify-between border-b border-iwb-border-light pb-2">
            <span className="text-xs text-iwb-slate-light">{t('deposit.routingNumber')}</span>
            <span className="text-sm font-mono font-medium text-iwb-navy">021000021</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-xs text-iwb-slate-light">{t('deposit.swiftBic')}</span>
            <span className="text-sm font-mono font-medium text-iwb-navy">IWBKUS33</span>
          </div>
        </div>
      </Card>

      {/* Deposit Form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="material-icons text-iwb-teal">compare_arrows</i>
          <h2 className="text-sm font-semibold text-iwb-navy">{t('deposit.initiateTransfer')}</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t('deposit.depositTo')}</label>
            <div className="mt-2 relative">
              <select
                value={selectedSubId}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="w-full appearance-none rounded-iwb-lg border border-iwb-border bg-white px-4 py-3.5 pr-10 text-sm text-iwb-navy focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              >
                {subAccounts.map((sa) => (
                  <option key={sa.id} value={sa.id}>
                    {sa.type.charAt(0).toUpperCase() + sa.type.slice(1)} — {symbol}{sa.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
              <i className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-iwb-slate-light pointer-events-none">expand_more</i>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t('deposit.amount')}</label>
            <div className="mt-2 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-iwb-navy">
                {symbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0.01"
                placeholder={t('deposit.amountPlaceholder')}
                className="w-full rounded-iwb-lg border border-iwb-border bg-white py-3.5 pl-10 pr-4 text-lg font-semibold text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              />
            </div>
            <div className="mt-2 flex gap-2">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addQuickAmount(val)}
                  className="rounded-iwb-md border border-iwb-border-light px-3 py-1.5 text-xs font-medium text-iwb-slate transition-colors hover:border-iwb-teal hover:text-iwb-teal"
                >
                  +{symbol}{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">
              {t('deposit.fromAccount')} <span className="text-iwb-error">*</span>
            </label>
            <input
              type="text"
              value={externalBank}
              onChange={(e) => setExternalBank(e.target.value)}
              placeholder={t('deposit.accountPlaceholder')}
              className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t('deposit.description')}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('deposit.descriptionPlaceholder')}
              maxLength={200}
              className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full rounded-iwb-md bg-iwb-teal px-6 py-3.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
        ) : null}
        {submitting ? t('deposit.submitting') : t('deposit.submit')}
      </button>

      <p className="flex items-center justify-center gap-1 text-xs text-iwb-slate-light">
        <i className="material-icons text-xs">verified_user</i>
        {t('deposit.creditedNote')}
      </p>
    </div>
  );
}
