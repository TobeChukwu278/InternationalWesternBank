import type { Transaction } from "@/types/database";
import { CategoryIcon } from "@/components/features/category-icon";

const typeLabel: Record<string, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  transfer: "Transfer",
  internal_transfer: "Internal Transfer",
};

const statusStyles: Record<string, string> = {
  completed: "bg-iwb-teal/10 text-iwb-teal",
  pending: "bg-iwb-navy/5 text-iwb-slate",
  failed: "bg-iwb-error/10 text-iwb-error",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

  const datePart = isToday ? "Today" : isYesterday ? "Yesterday" : date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });

  return {
    date: datePart,
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

export function TransactionRow({
  transaction,
  isIncoming,
}: {
  transaction: Transaction;
  isIncoming: boolean;
}) {
  const { date, time } = formatDate(transaction.created_at);

  return (
    <div className="grid grid-cols-12 gap-3 px-6 py-3.5 transition-colors hover:bg-iwb-surface/50 items-center">
      <div className="col-span-2">
        <p className="text-sm text-iwb-navy">{date}</p>
        <p className="text-xs text-iwb-slate-light">{time}</p>
      </div>

      <div className="col-span-3 flex items-center gap-3">
        <CategoryIcon category={transaction.category ?? "other"} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-iwb-navy">
            {transaction.merchant_name || transaction.description || transaction.reference.slice(0, 16)}
          </p>
        </div>
      </div>

      <div className="col-span-2">
        <span className="text-sm capitalize text-iwb-slate">
          {(transaction.category ?? "other").replace("_", " ")}
        </span>
      </div>

      <div className="col-span-2">
        <span className={`rounded-iwb-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[transaction.status] ?? statusStyles.pending}`}>
          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
        </span>
      </div>

      <div className="col-span-3 text-right">
        <p className={`text-sm font-semibold ${isIncoming ? "text-iwb-teal" : "text-iwb-navy"}`}>
          {isIncoming ? "+" : "-"}${Number(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
