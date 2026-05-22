"use client";

import { useLocale } from "@/i18n/client";

interface SubAccountOption {
  id: string;
  type: string;
  balance: number;
  is_default: boolean;
}

interface TransferDetailsProps {
  subAccounts: SubAccountOption[];
  fromAccount: string;
  onFromAccountChange: (id: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  reference: string;
  onReferenceChange: (value: string) => void;
  exceedsBalance: boolean;
  preferredCurrency: string;
}

const QUICK_AMOUNTS = [100, 500, 1000];

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function TransferDetails({
  subAccounts,
  fromAccount,
  onFromAccountChange,
  amount,
  onAmountChange,
  reference,
  onReferenceChange,
  exceedsBalance,
  preferredCurrency,
}: TransferDetailsProps) {
  const { t } = useLocale();
  const symbol = currencySymbols[preferredCurrency] ?? "$";
  const selected = subAccounts.find((sa) => sa.id === fromAccount);

  function addQuickAmount(val: number) {
    const current = parseFloat(amount) || 0;
    onAmountChange(String(current + val));
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t('send.fromAccount')}</label>
        <div className="mt-2 relative">
          <select
            value={fromAccount}
            onChange={(e) => onFromAccountChange(e.target.value)}
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
        {selected ? (
          <p className="mt-1.5 text-xs text-iwb-slate">
            Available: {symbol}{selected.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t('send.amount')}</label>
        <div className="mt-2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-iwb-navy">
            {symbol}
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            step="0.01"
            min="0.01"
            placeholder={t('send.amountPlaceholder')}
            className="w-full rounded-iwb-lg border border-iwb-border bg-white py-3.5 pl-10 pr-4 text-lg font-semibold text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
          />
        </div>
        {exceedsBalance ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-iwb-error">
            <i className="material-icons text-sm">error</i>
            {t('send.insufficientFunds')}
          </p>
        ) : null}
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
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">{t('send.description')}</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => onReferenceChange(e.target.value)}
          placeholder={t('send.descriptionPlaceholder')}
          maxLength={200}
          className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
        />
      </div>
    </div>
  );
}
