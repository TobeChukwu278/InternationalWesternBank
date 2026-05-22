"use client";

import { useState } from "react";
import type { Transaction, Notification } from "@/types/database";
import { TransactionRow } from "./transaction-row";
import { TransactionReceipt } from "@/components/features/transaction-receipt";
import { NotificationBell } from "@/components/features/notification-bell";
import { useLocale } from "@/i18n/client";

interface TransactionHistoryProps {
  initialTransactions: Transaction[];
  initialTotalCount: number;
  initialPage: number;
  searchParams: Record<string, string>;
  subAccountIds: string[];
  accountNumber: string;
  notificationUnreadCount: number;
  notificationInitialNotifications: Notification[];
}

export function TransactionHistory({
  initialTransactions,
  initialTotalCount,
  initialPage,
  searchParams,
  subAccountIds,
  accountNumber,
  notificationUnreadCount,
  notificationInitialNotifications,
}: TransactionHistoryProps) {
  const { t } = useLocale();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const loadedCount = transactions.length;
  const hasMore = loadedCount < initialTotalCount;
  const subAccountSet = new Set(subAccountIds);

  function isIncoming(tx: Transaction): boolean {
    const isOutgoing = tx.from_sub_account_id && subAccountSet.has(tx.from_sub_account_id);
    const isIncomingTx = tx.to_sub_account_id && subAccountSet.has(tx.to_sub_account_id);
    if (isOutgoing && !isIncomingTx) return false;
    return true;
  }

  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    try {
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      setTransactions((prev) => [...prev, ...data.transactions]);
      setPage(nextPage);
    } catch {
      // silently fail — user can retry
    } finally {
      setLoading(false);
    }
  }

  const exportUrl = `/api/transactions/export?${new URLSearchParams(searchParams).toString()}`;

  return (
    <div className="rounded-iwb-lg bg-white shadow-iwb-card">
      <div className="flex items-center justify-between border-b border-iwb-border-light px-6 py-4">
        <h3 className="text-sm font-semibold text-iwb-navy">{t('transactions.allTransactions')}</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-base text-iwb-slate-light">search</i>
            <form method="GET" action="/transactions">
              {Object.entries(searchParams).map(([k, v]) =>
                k !== "search" && k !== "page" ? (
                  <input key={k} type="hidden" name={k} value={v} />
                ) : null,
              )}
              <input
                name="search"
                type="search"
                defaultValue={searchParams.search ?? ""}
                placeholder={t('common.search')}
                className="w-64 rounded-iwb-md border border-iwb-border bg-white py-2 pl-10 pr-4 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              />
            </form>
          </div>
          <NotificationBell initialUnreadCount={notificationUnreadCount} initialNotifications={notificationInitialNotifications} />
          <a
            href={exportUrl}
            className="flex items-center gap-1.5 rounded-iwb-md border border-iwb-border px-3 py-1.5 text-xs font-medium text-iwb-navy transition-colors hover:bg-iwb-surface"
          >
            <i className="material-icons text-base">file_download</i>
            {t('transactions.export')}
          </a>
        </div>
      </div>

      <form method="GET" action="/transactions" className="border-b border-iwb-border-light px-6 py-3">
        {Object.entries(searchParams).map(([k, v]) =>
          k !== "category" && k !== "status" && k !== "page" ? (
            <input key={k} type="hidden" name={k} value={v} />
          ) : null,
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 rounded-iwb-md border border-iwb-border px-2.5 py-1.5 text-xs text-iwb-slate">
            <i className="material-icons text-sm">calendar_today</i>
            Last 30 Days
            <i className="material-icons text-sm">expand_more</i>
          </span>
          <label className="flex items-center gap-1 rounded-iwb-md border border-iwb-border px-2.5 py-1.5 text-xs text-iwb-slate cursor-pointer hover:bg-iwb-surface transition-colors has-focus-within:border-iwb-teal">
            <i className="material-icons text-sm">category</i>
            <select
              name="category"
              value={searchParams.category ?? ""}
              onChange={(e) => e.target.form?.requestSubmit()}
              className="appearance-none bg-transparent text-xs text-iwb-slate focus:outline-none cursor-pointer"
            >
              <option value="">{t('transactions.filter')}</option>
              <option value="shopping">{t('accounts.categoryShopping')}</option>
              <option value="dining">{t('accounts.categoryDining')}</option>
              <option value="travel">{t('accounts.categoryTravel')}</option>
              <option value="utilities">{t('accounts.categoryUtilities')}</option>
              <option value="investment">{t('accounts.categoryInvestment')}</option>
              <option value="deposit">{t('transactions.deposit')}</option>
              <option value="transfer">{t('transactions.transfer')}</option>
              <option value="withdrawal">{t('transactions.withdrawal')}</option>
            </select>
            <i className="material-icons text-sm pointer-events-none">expand_more</i>
          </label>
          <label className="flex items-center gap-1 rounded-iwb-md border border-iwb-border px-2.5 py-1.5 text-xs text-iwb-slate cursor-pointer hover:bg-iwb-surface transition-colors has-focus-within:border-iwb-teal">
            <i className="material-icons text-sm">info</i>
            <select
              name="status"
              value={searchParams.status ?? ""}
              onChange={(e) => e.target.form?.requestSubmit()}
              className="appearance-none bg-transparent text-xs text-iwb-slate focus:outline-none cursor-pointer"
            >
              <option value="">{t('common.status')}</option>
              <option value="completed">{t('transactions.completed')}</option>
              <option value="pending">{t('transactions.pending')}</option>
              <option value="failed">{t('transactions.failed')}</option>
            </select>
            <i className="material-icons text-sm pointer-events-none">expand_more</i>
          </label>
          <span className="flex items-center gap-1 rounded-iwb-md border border-iwb-border bg-iwb-surface px-2.5 py-1.5 text-xs text-iwb-slate">
            <i className="material-icons text-sm">filter_list</i>
            Advanced
          </span>
        </div>
      </form>

      {transactions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-iwb-surface">
            <i className="material-icons text-2xl text-iwb-slate">receipt_long</i>
          </div>
          <p className="mt-4 text-sm font-medium text-iwb-navy">{t('transactions.noTransactions')}</p>
          <p className="mt-1 text-xs text-iwb-slate">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div>
          <div className="hidden grid-cols-12 gap-3 border-b border-iwb-border-light bg-iwb-surface/50 px-6 py-3 text-xs font-medium uppercase tracking-wider text-iwb-slate-light md:grid">
            <span className="col-span-2">{t('transactions.date')}</span>
            <span className="col-span-3">{t('transactions.description')}</span>
            <span className="col-span-2">{t('transactions.type')}</span>
            <span className="col-span-2">{t('common.status')}</span>
            <span className="col-span-3 text-right">{t('transactions.amount')}</span>
          </div>

          <div className="divide-y divide-iwb-border-light">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                isIncoming={isIncoming(tx)}
                onSelect={setSelectedTx}
              />
            ))}
          </div>

          <div className="border-t border-iwb-border-light px-6 py-3">
            <p className="text-xs text-iwb-slate">
              Showing {loadedCount} of {initialTotalCount} transactions
            </p>
          </div>

          {hasMore ? (
            <div className="border-t border-iwb-border-light px-6 py-4 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-iwb-md border border-iwb-border px-6 py-2.5 text-sm font-medium text-iwb-navy transition-all hover:bg-iwb-surface disabled:opacity-50"
              >
                {loading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
                ) : (
                  <i className="material-icons text-base">arrow_downward</i>
                )}
                {loading ? t('common.loading') : "Load More Transactions"}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {selectedTx ? (
        <TransactionReceipt
          transaction={selectedTx}
          isIncoming={isIncoming(selectedTx)}
          accountNumber={accountNumber}
          onClose={() => setSelectedTx(null)}
        />
      ) : null}
    </div>
  );
}
