import type { Transaction } from "@/types/database";

const typeConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  deposit: {
    label: "Deposit",
    color: "text-iwb-teal",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  withdrawal: {
    label: "Withdrawal",
    color: "text-iwb-error",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
  },
  transfer: {
    label: "Transfer",
    color: "text-iwb-navy",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  internal_transfer: {
    label: "Internal Transfer",
    color: "text-iwb-slate-light",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (!transactions.length) {
    return (
      <div className="rounded-iwb-lg bg-white p-12 text-center shadow-iwb-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-iwb-surface">
          <svg className="size-6 text-iwb-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-iwb-navy">No transactions yet</p>
        <p className="mt-1 text-xs text-iwb-slate">Your transactions will appear here</p>
      </div>
    );
  }

  return (
    <div className="rounded-iwb-lg bg-white shadow-iwb-card">
      <div className="flex items-center justify-between border-b border-iwb-border-light px-6 py-4">
        <h3 className="text-sm font-semibold text-iwb-navy">Recent Transactions</h3>
        <a href="/transactions" className="text-xs font-medium text-iwb-teal hover:text-iwb-teal-dark transition-colors">
          View all
        </a>
      </div>
      <div className="divide-y divide-iwb-border-light">
        {transactions.slice(0, 5).map((tx) => {
          const config = (typeConfig[tx.type] ?? typeConfig.transfer)!;
          return (
            <div
              key={tx.id}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-iwb-surface"
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-iwb-surface ${config.color}`}>
                {config.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-iwb-navy">{config.label}</p>
                <p className="text-xs text-iwb-slate">{formatDate(tx.created_at)}</p>
              </div>
              <span className={`text-sm font-semibold ${tx.type === "deposit" ? "text-iwb-teal" : "text-iwb-navy"}`}>
                {tx.type === "deposit" ? "+" : "-"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
