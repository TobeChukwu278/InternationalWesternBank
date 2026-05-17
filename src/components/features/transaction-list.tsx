import type { Transaction } from "@/types/database";

const ITEMS_PER_PAGE = 15;

type Direction = "incoming" | "outgoing";

interface TransactionRowProps {
  transaction: Transaction;
  direction: Direction;
}

function TransactionIcon({ type, direction }: { type: string; direction: Direction }) {
  if (type === "deposit") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </span>
    );
  }
  if (type === "withdrawal") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-iwb-error/10 text-iwb-error">
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </span>
    );
  }
  if (direction === "incoming") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-iwb-navy/10 text-iwb-navy">
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </span>
  );
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    completed: "bg-iwb-teal/10 text-iwb-teal",
    pending: "bg-iwb-navy/5 text-iwb-slate",
    failed: "bg-iwb-error/10 text-iwb-error",
  };
  return (
    <span className={`rounded-iwb-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return `Today ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  if (days === 1) return `Yesterday ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function TransactionRow({ transaction, direction }: TransactionRowProps) {
  const typeLabel: Record<string, string> = {
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    transfer: direction === "incoming" ? "Received" : "Sent",
    internal_transfer: "Internal Transfer",
  };

  return (
    <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-iwb-surface">
      <TransactionIcon type={transaction.type} direction={direction} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-iwb-navy">
          {typeLabel[transaction.type] ?? "Transfer"}
        </p>
        <p className="truncate text-xs text-iwb-slate">
          {transaction.description || transaction.reference.slice(0, 16) + "..."}
        </p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-xs text-iwb-slate">{formatDate(transaction.created_at)}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${direction === "incoming" ? "text-iwb-teal" : "text-iwb-navy"}`}>
          {direction === "incoming" ? "+" : "-"}${Number(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className="hidden sm:block">{statusBadge(transaction.status)}</div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string>;
}) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    return `/transactions?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <div className="flex items-center justify-between border-t border-iwb-border-light px-6 py-4">
      <p className="text-xs text-iwb-slate">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <a
          href={buildUrl(currentPage - 1)}
          className={`rounded-iwb-md px-3 py-1.5 text-sm font-medium transition-colors ${
            currentPage <= 1
              ? "pointer-events-none text-iwb-slate-light"
              : "text-iwb-navy hover:bg-iwb-surface"
          }`}
        >
          Previous
        </a>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className="px-2 text-xs text-iwb-slate-light">
              ...
            </span>
          ) : (
            <a
              key={p}
              href={buildUrl(p)}
              className={`rounded-iwb-md px-3 py-1.5 text-sm font-medium transition-colors ${
                p === currentPage
                  ? "bg-iwb-teal text-white"
                  : "text-iwb-navy hover:bg-iwb-surface"
              }`}
            >
              {p}
            </a>
          ),
        )}
        <a
          href={buildUrl(currentPage + 1)}
          className={`rounded-iwb-md px-3 py-1.5 text-sm font-medium transition-colors ${
            currentPage >= totalPages
              ? "pointer-events-none text-iwb-slate-light"
              : "text-iwb-navy hover:bg-iwb-surface"
          }`}
        >
          Next
        </a>
      </div>
    </div>
  );
}

function FilterLink({
  label,
  value,
  currentValue,
  paramName,
  searchParams,
}: {
  label: string;
  value: string;
  currentValue: string | undefined;
  paramName: string;
  searchParams: Record<string, string>;
}) {
  const isActive = currentValue === value || (!currentValue && value === "");
  const buildUrl = () => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(paramName, value);
    else params.delete(paramName);
    params.delete("page");
    return `/transactions?${params.toString()}`;
  };

  return (
    <a
      href={buildUrl()}
      className={`whitespace-nowrap rounded-iwb-full px-3 py-1.5 text-xs font-medium transition-colors ${
        isActive
          ? "bg-iwb-navy text-white"
          : "bg-iwb-surface text-iwb-slate hover:bg-iwb-surface-dim"
      }`}
    >
      {label}
    </a>
  );
}

export interface TransactionListProps {
  transactions: Transaction[];
  subAccountIds: string[];
  totalCount: number;
  searchParams: Record<string, string>;
  currentPage: number;
}

export function TransactionList({
  transactions,
  subAccountIds,
  totalCount,
  searchParams,
  currentPage,
}: TransactionListProps) {
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const currentType = searchParams.type;
  const currentDirection = searchParams.direction ?? "";
  const currentStatus = searchParams.status ?? "";

  const subAccountSet = new Set(subAccountIds);

  function determineDirection(tx: Transaction): Direction {
    const isOutgoing = tx.from_sub_account_id && subAccountSet.has(tx.from_sub_account_id);
    const isIncoming = tx.to_sub_account_id && subAccountSet.has(tx.to_sub_account_id);
    if (isOutgoing && !isIncoming) return "outgoing";
    return "incoming";
  }

  return (
    <div className="rounded-iwb-lg bg-white shadow-iwb-card">
      <div className="border-b border-iwb-border-light px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterLink label="All" value="" currentValue={currentDirection} paramName="direction" searchParams={searchParams} />
          <FilterLink label="Sent" value="outgoing" currentValue={currentDirection} paramName="direction" searchParams={searchParams} />
          <FilterLink label="Received" value="incoming" currentValue={currentDirection} paramName="direction" searchParams={searchParams} />

          <span className="mx-2 h-5 w-px bg-iwb-border-light" />

          <FilterLink label="All Types" value="" currentValue={currentType} paramName="type" searchParams={searchParams} />
          <FilterLink label="Deposits" value="deposit" currentValue={currentType} paramName="type" searchParams={searchParams} />
          <FilterLink label="Transfers" value="transfer" currentValue={currentType} paramName="type" searchParams={searchParams} />
          <FilterLink label="Withdrawals" value="withdrawal" currentValue={currentType} paramName="type" searchParams={searchParams} />

          <span className="mx-2 h-5 w-px bg-iwb-border-light" />

          <FilterLink label="All Status" value="" currentValue={currentStatus} paramName="status" searchParams={searchParams} />
          <FilterLink label="Completed" value="completed" currentValue={currentStatus} paramName="status" searchParams={searchParams} />
          <FilterLink label="Pending" value="pending" currentValue={currentStatus} paramName="status" searchParams={searchParams} />
          <FilterLink label="Failed" value="failed" currentValue={currentStatus} paramName="status" searchParams={searchParams} />
        </div>

        <form method="GET" action="/transactions" className="mt-4">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-iwb-slate-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              name="search"
              type="search"
              defaultValue={searchParams.search ?? ""}
              placeholder="Search by description or reference..."
              className="w-full rounded-iwb-md border border-iwb-border bg-white py-2.5 pl-10 pr-4 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            />
          </div>
          {Object.entries(searchParams).map(([k, v]) =>
            k !== "search" && k !== "page" ? (
              <input key={k} type="hidden" name={k} value={v} />
            ) : null,
          )}
        </form>
      </div>

      {transactions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-iwb-surface">
            <svg className="size-6 text-iwb-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-iwb-navy">No transactions found</p>
          <p className="mt-1 text-xs text-iwb-slate">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="divide-y divide-iwb-border-light">
          <div className="hidden items-center gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider text-iwb-slate-light sm:flex">
            <span className="flex size-10 shrink-0" />
            <span className="min-w-0 flex-1">Description</span>
            <span className="hidden text-right sm:block sm:w-28">Date</span>
            <span className="w-24 text-right">Amount</span>
            <span className="w-20 text-center sm:block">Status</span>
          </div>
          {transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              direction={determineDirection(tx)}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        searchParams={searchParams}
      />
    </div>
  );
}
