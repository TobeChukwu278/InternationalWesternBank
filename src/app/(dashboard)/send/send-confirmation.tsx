"use client";

interface SendConfirmationProps {
  recipientName: string;
  recipientAccount: string;
  fromAccountName: string;
  amount: string;
  reference: string;
  preferredCurrency: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const currencySymbols: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£",
};

export function SendConfirmation({
  recipientName,
  recipientAccount,
  fromAccountName,
  amount,
  reference,
  preferredCurrency,
  onConfirm,
  onCancel,
  loading,
}: SendConfirmationProps) {
  const symbol = currencySymbols[preferredCurrency] ?? "$";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-iwb-navy/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm animate-[fadeIn_200ms_ease-out,slideUp_200ms_ease-out] rounded-iwb-xl bg-white shadow-iwb-overlay">
        <div className="p-6">
          <div className="text-center pb-4 border-b border-dashed border-iwb-border-light">
            <i className="material-icons text-4xl text-iwb-slate-light mb-2">swap_horiz</i>
            <h2 className="text-base font-semibold text-iwb-navy">Review Transfer</h2>
          </div>

          <div className="py-4 space-y-3 border-b border-dashed border-iwb-border-light">
            <div className="flex justify-between items-center">
              <span className="text-xs text-iwb-slate-light">To</span>
              <span className="text-sm font-medium text-iwb-navy">{recipientName} •••• {recipientAccount.slice(-4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-iwb-slate-light">From</span>
              <span className="text-sm font-medium text-iwb-navy">{fromAccountName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-iwb-slate-light">Amount</span>
              <span className="text-xl font-bold text-iwb-navy">
                {symbol}{parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {reference ? (
              <div className="flex justify-between items-center">
                <span className="text-xs text-iwb-slate-light">Reference</span>
                <span className="text-sm text-iwb-navy">{reference}</span>
              </div>
            ) : null}
          </div>

          <div className="py-3 text-center">
            <p className="text-xs text-iwb-slate">
              <i className="material-icons text-xs align-text-bottom">verified_user</i>{" "}
              Fees: $0.00 • Free transfer within IWB
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-iwb-md border-2 border-iwb-border px-4 py-2.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-iwb-md bg-iwb-teal px-4 py-2.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
              ) : null}
              {loading ? "Sending..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
