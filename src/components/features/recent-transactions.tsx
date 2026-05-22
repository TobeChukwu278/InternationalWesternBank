import type { Transaction } from "@/types/database";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryIcon } from "@/components/features/category-icon";
import { t } from "@/i18n/server";

function formatRelativeTime(dateStr: string, today: string, yesterday: string, daysAgo: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return today;
  if (days === 1) return yesterday;
  if (days < 7) return daysAgo.replace("{{count}}", String(days));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  subAccountIds: string[];
}

function isIncoming(tx: Transaction, subAccountSet: Set<string>): boolean {
  const isOutgoing = tx.from_sub_account_id && subAccountSet.has(tx.from_sub_account_id);
  const isIncomingTx = tx.to_sub_account_id && subAccountSet.has(tx.to_sub_account_id);
  if (isOutgoing && !isIncomingTx) return false;
  return true;
}

export async function RecentTransactions({ transactions, subAccountIds }: RecentTransactionsProps) {
  const subAccountSet = new Set(subAccountIds);
  const today = await t("common.today");
  const yesterday = await t("common.yesterday");
  const daysAgo = await t("common.daysAgo");
  const recentTransactions = await t("dashboard.recentTransactions");
  const viewAll = await t("dashboard.viewAll");
  const noTransactionsTitle = await t("dashboard.noTransactions");
  const noTransactionsDesc = await t("dashboard.noTransactionsDesc");

  if (!transactions.length) {
    return (
      <div className="rounded-iwb-lg bg-white shadow-iwb-card">
        <div className="flex items-center justify-between border-b border-iwb-border-light px-6 py-4">
          <h3 className="text-sm font-semibold text-iwb-navy">{recentTransactions}</h3>
        </div>
        <EmptyState
          title={noTransactionsTitle}
          description={noTransactionsDesc}
        />
      </div>
    );
  }

  return (
    <div className="rounded-iwb-lg bg-white shadow-iwb-card">
      <div className="flex items-center justify-between border-b border-iwb-border-light px-6 py-4">
        <h3 className="text-sm font-semibold text-iwb-navy">{recentTransactions}</h3>
        <a href="/transactions" className="text-xs font-medium text-iwb-teal hover:text-iwb-teal-dark transition-colors">
          {viewAll}
        </a>
      </div>
      <div className="divide-y divide-iwb-border-light">
        {transactions.slice(0, 5).map((tx) => {
          const incoming = isIncoming(tx, subAccountSet);
          return (
            <div
              key={tx.id}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-iwb-surface"
            >
              <CategoryIcon category={tx.category ?? "other"} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-iwb-navy">
                  {tx.merchant_name || tx.description || tx.reference.slice(0, 16)}
                </p>
                <p className="text-xs text-iwb-slate">{formatRelativeTime(tx.created_at, today, yesterday, daysAgo)}</p>
              </div>
              <span className={`text-sm font-semibold ${incoming ? "text-iwb-teal" : "text-iwb-navy"}`}>
                {incoming ? "+" : "-"}${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
