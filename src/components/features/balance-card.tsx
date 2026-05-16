interface BalanceCardProps {
  totalBalance: number;
  accountNumber: string;
}

export function BalanceCard({ totalBalance, accountNumber }: BalanceCardProps) {
  return (
    <div className="rounded-iwb-xl bg-iwb-navy p-6 text-white shadow-iwb-card">
      <p className="text-sm font-medium text-iwb-slate-light">Total Balance</p>
      <p className="mt-2 text-4xl font-bold tracking-tight">
        ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-xs text-iwb-slate-light">Account Number</p>
          <p className="mt-0.5 font-mono text-sm tracking-wider">{accountNumber}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full bg-white/10">
          <svg className="size-5 text-iwb-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16" />
          </svg>
        </div>
      </div>
    </div>
  );
}
