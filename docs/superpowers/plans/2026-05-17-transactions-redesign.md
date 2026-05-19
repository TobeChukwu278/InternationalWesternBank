# Transactions Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the transactions page with the Stitch design — add merchant/category columns, category-specific Material Icons, API-backed "Load More", CSV export, and table-style layout.

**Architecture:** DB schema adds `merchant_name` + `category` columns. Server component does initial SSR load. Two API routes handle paginated fetch and CSV export. Client component manages "Load More" state via API calls. Filters still cause full page reloads via URL searchParams.

**Tech Stack:** Next.js 16 App Router, Supabase (server + service client), Material Icons (Google Fonts CDN), Zod shapes from existing types.

---

### Task 1: DB Migration (via Supabase Dashboard SQL Editor)

**Files:**
- Create: `supabase/migrations/00007_transactions_merchant_category.sql`

- [ ] **Step 1: Write migration SQL**

```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS merchant_name TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';

-- Backfill existing rows
UPDATE transactions SET category = 'transfer' WHERE category = 'other' AND type IN ('transfer', 'internal_transfer');
UPDATE transactions SET category = 'deposit' WHERE category = 'other' AND type = 'deposit';
UPDATE transactions SET category = 'withdrawal' WHERE category = 'other' AND type = 'withdrawal';
UPDATE transactions SET merchant_name = description WHERE merchant_name IS NULL;
```

- [ ] **Step 2: Apply via Supabase Dashboard SQL Editor**

Open Supabase Dashboard → SQL Editor → paste and run.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00007_transactions_merchant_category.sql
git commit -m "feat: add merchant_name and category columns to transactions"
```

---

### Task 2: Add Material Icons CDN

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add Material Icons stylesheet link to layout**

```tsx
<html lang="en" className={inter.variable}>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  <body className="bg-iwb-surface font-sans text-iwb-navy antialiased">
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Material Icons CDN stylesheet"
```

---

### Task 3: Create CategoryIcon Component

**Files:**
- Create: `src/components/features/category-icon.tsx`

- [ ] **Step 1: Write the component**

```tsx
interface CategoryIconProps {
  category: string;
  className?: string;
}

const iconMap: Record<string, string> = {
  shopping: "shopping_bag",
  dining: "restaurant",
  travel: "flight",
  utilities: "bolt",
  investment: "account_balance",
  deposit: "account_balance_wallet",
  transfer: "send",
  withdrawal: "money_off",
};

const colorMap: Record<string, string> = {
  shopping: "bg-iwb-navy/10 text-iwb-navy",
  dining: "bg-iwb-teal/10 text-iwb-teal",
  travel: "bg-iwb-slate-light/10 text-iwb-slate-light",
  utilities: "bg-iwb-error/10 text-iwb-error",
  investment: "bg-iwb-teal/10 text-iwb-teal",
  deposit: "bg-iwb-teal/10 text-iwb-teal",
  transfer: "bg-iwb-navy/10 text-iwb-navy",
  withdrawal: "bg-iwb-error/10 text-iwb-error",
  other: "bg-iwb-border-light text-iwb-slate",
};

export function CategoryIcon({ category, className = "" }: CategoryIconProps) {
  const icon = iconMap[category] ?? "receipt_long";
  const color = colorMap[category] ?? colorMap.other;

  return (
    <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${color} ${className}`}>
      <i className="material-icons text-lg">{icon}</i>
    </span>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/features/category-icon.tsx
git commit -m "feat: add CategoryIcon component with Material Icons"
```

---

### Task 4: Create API Route for Paginated Transactions

**Files:**
- Create: `src/app/api/transactions/route.ts`

- [ ] **Step 1: Write the API route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 15));
  const typeFilter = searchParams.get("type") || undefined;
  const statusFilter = searchParams.get("status") || undefined;
  const directionFilter = searchParams.get("direction") || undefined;
  const searchQuery = searchParams.get("search") || undefined;
  const categoryFilter = searchParams.get("category") || undefined;

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(id)")
    .eq("user_id", user.id)
    .single();

  if (!account) {
    return NextResponse.json({ transactions: [], page, totalPages: 0, totalCount: 0 });
  }

  const subAccountIds = (account.sub_accounts as { id: string }[]).map((sa) => sa.id);

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .or(
      `from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`,
    );

  if (typeFilter) query = query.eq("type", typeFilter);
  if (statusFilter) query = query.eq("status", statusFilter);
  if (categoryFilter) query = query.eq("category", categoryFilter);

  if (directionFilter === "incoming") {
    query = query.not("to_sub_account_id", "is", null).in("to_sub_account_id", subAccountIds);
  } else if (directionFilter === "outgoing") {
    query = query.not("from_sub_account_id", "is", null).in("from_sub_account_id", subAccountIds);
  }

  if (searchQuery) {
    query = query.or(
      `merchant_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,reference.ilike.%${searchQuery}%`,
    );
  }

  const from = (page - 1) * limit;
  const { data: transactions, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  return NextResponse.json({
    transactions: transactions ?? [],
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
    totalCount: count ?? 0,
  });
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/transactions/route.ts
git commit -m "feat: add GET /api/transactions for paginated fetch"
```

---

### Task 5: Create API Route for CSV Export

**Files:**
- Create: `src/app/api/transactions/export/route.ts`

- [ ] **Step 1: Write the export route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get("type") || undefined;
  const statusFilter = searchParams.get("status") || undefined;
  const directionFilter = searchParams.get("direction") || undefined;
  const searchQuery = searchParams.get("search") || undefined;
  const categoryFilter = searchParams.get("category") || undefined;

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(id)")
    .eq("user_id", user.id)
    .single();

  if (!account) return new NextResponse("No data", { status: 404 });

  const subAccountIds = (account.sub_accounts as { id: string }[]).map((sa) => sa.id);

  let query = supabase
    .from("transactions")
    .select("*")
    .or(
      `from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`,
    );

  if (typeFilter) query = query.eq("type", typeFilter);
  if (statusFilter) query = query.eq("status", statusFilter);
  if (categoryFilter) query = query.eq("category", categoryFilter);

  if (directionFilter === "incoming") {
    query = query.not("to_sub_account_id", "is", null).in("to_sub_account_id", subAccountIds);
  } else if (directionFilter === "outgoing") {
    query = query.not("from_sub_account_id", "is", null).in("from_sub_account_id", subAccountIds);
  }

  if (searchQuery) {
    query = query.or(
      `merchant_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,reference.ilike.%${searchQuery}%`,
    );
  }

  const { data: transactions } = await query.order("created_at", { ascending: false });

  const headers = ["Date", "Merchant", "Category", "Type", "Status", "Amount", "Reference"];
  const rows = (transactions ?? []).map((tx) => [
    new Date(tx.created_at).toISOString(),
    tx.merchant_name ?? "",
    tx.category ?? "",
    tx.type,
    tx.status,
    Number(tx.amount).toFixed(2),
    tx.reference,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/transactions/export/route.ts
git commit -m "feat: add GET /api/transactions/export for CSV download"
```

---

### Task 6: Create TransactionRow Component

**Files:**
- Create: `src/app/(dashboard)/transactions/transaction-row.tsx`

- [ ] **Step 1: Write the row component**

```tsx
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
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/transactions/transaction-row.tsx
git commit -m "feat: add TransactionRow component with date/merchant/category/status/amount columns"
```

---

### Task 7: Create TransactionHistory Client Component

**Files:**
- Create: `src/app/(dashboard)/transactions/transaction-history.tsx`

- [ ] **Step 1: Write the client component**

```tsx
"use client";

import { useState } from "react";
import type { Transaction } from "@/types/database";
import { TransactionRow } from "./transaction-row";

interface TransactionHistoryProps {
  initialTransactions: Transaction[];
  initialTotalCount: number;
  initialPage: number;
  searchParams: Record<string, string>;
  subAccountIds: string[];
}

export function TransactionHistory({
  initialTransactions,
  initialTotalCount,
  initialPage,
  searchParams,
  subAccountIds,
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);

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
        <h3 className="text-sm font-semibold text-iwb-navy">Transaction History</h3>
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
                placeholder="Search transactions..."
                className="w-64 rounded-iwb-md border border-iwb-border bg-white py-2 pl-10 pr-4 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              />
            </form>
          </div>
          <button className="rounded-lg p-1.5 text-iwb-slate-light transition-colors hover:bg-iwb-surface hover:text-iwb-navy" title="Notifications">
            <i className="material-icons text-xl">notifications</i>
          </button>
          <a
            href={exportUrl}
            className="flex items-center gap-1.5 rounded-iwb-md border border-iwb-border px-3 py-1.5 text-xs font-medium text-iwb-navy transition-colors hover:bg-iwb-surface"
          >
            <i className="material-icons text-base">file_download</i>
            Export CSV
          </a>
        </div>
      </div>

      <div className="border-b border-iwb-border-light px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 rounded-iwb-md border border-iwb-border px-2.5 py-1.5 text-xs text-iwb-slate">
            <i className="material-icons text-sm">calendar_today</i>
            Last 30 Days
            <i className="material-icons text-sm">expand_more</i>
          </span>
          <span className="flex items-center gap-1 rounded-iwb-md border border-iwb-border px-2.5 py-1.5 text-xs text-iwb-slate">
            <i className="material-icons text-sm">category</i>
            Category
            <i className="material-icons text-sm">expand_more</i>
          </span>
          <span className="flex items-center gap-1 rounded-iwb-md border border-iwb-border px-2.5 py-1.5 text-xs text-iwb-slate">
            <i className="material-icons text-sm">info</i>
            Status
            <i className="material-icons text-sm">expand_more</i>
          </span>
          <span className="flex items-center gap-1 rounded-iwb-md border border-iwb-border bg-iwb-surface px-2.5 py-1.5 text-xs text-iwb-slate">
            <i className="material-icons text-sm">filter_list</i>
            Advanced
          </span>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-iwb-surface">
            <i className="material-icons text-2xl text-iwb-slate">receipt_long</i>
          </div>
          <p className="mt-4 text-sm font-medium text-iwb-navy">No transactions found</p>
          <p className="mt-1 text-xs text-iwb-slate">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div>
          <div className="hidden grid-cols-12 gap-3 border-b border-iwb-border-light bg-iwb-surface/50 px-6 py-3 text-xs font-medium uppercase tracking-wider text-iwb-slate-light md:grid">
            <span className="col-span-2">Date</span>
            <span className="col-span-3">Merchant</span>
            <span className="col-span-2">Category</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-3 text-right">Amount</span>
          </div>

          <div className="divide-y divide-iwb-border-light">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                isIncoming={isIncoming(tx)}
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
                {loading ? "Loading..." : "Load More Transactions"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/transactions/transaction-history.tsx
git commit -m "feat: add TransactionHistory client component with Load More"
```

---

### Task 8: Update Transactions Server Page

**Files:**
- Modify: `src/app/(dashboard)/transactions/page.tsx`
- Remove: `src/components/features/transaction-list.tsx`

- [ ] **Step 1: Rewrite the server page**

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransactionHistory } from "./transaction-history";

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

const ITEMS_PER_PAGE = 15;

export default async function TransactionsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp.page) || 1);
  const typeFilter = sp.type || undefined;
  const statusFilter = sp.status || undefined;
  const directionFilter = sp.direction || undefined;
  const searchQuery = sp.search || undefined;
  const categoryFilter = sp.category || undefined;

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(id)")
    .eq("user_id", user.id)
    .single();

  if (!account) redirect("/login");

  const subAccountIds = (account.sub_accounts as { id: string }[]).map((sa) => sa.id);

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .or(
      `from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`,
    );

  if (typeFilter) query = query.eq("type", typeFilter);
  if (statusFilter) query = query.eq("status", statusFilter);
  if (categoryFilter) query = query.eq("category", categoryFilter);

  if (directionFilter === "incoming") {
    query = query.not("to_sub_account_id", "is", null).in("to_sub_account_id", subAccountIds);
  } else if (directionFilter === "outgoing") {
    query = query.not("from_sub_account_id", "is", null).in("from_sub_account_id", subAccountIds);
  }

  if (searchQuery) {
    query = query.or(
      `merchant_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,reference.ilike.%${searchQuery}%`,
    );
  }

  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const { data: transactions, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + ITEMS_PER_PAGE - 1);

  // Fetch total balance for the "Total Assets" badge
  const { data: fullAccount } = await supabase
    .from("accounts")
    .select("*, sub_accounts(balance)")
    .eq("user_id", user.id)
    .single();

  const totalBalance = (fullAccount?.sub_accounts as { balance: number }[] ?? [])
    .reduce((s, sa) => s + Number(sa.balance), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-iwb-navy">Transactions</h1>
          <p className="mt-1 text-sm text-iwb-slate">
            View your complete transaction history
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-iwb-lg bg-iwb-teal/10 px-4 py-2">
          <span className="text-2xl font-bold text-iwb-navy">
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </span>
          <span className="text-xs text-iwb-slate">Total Assets</span>
        </div>
      </div>

      <TransactionHistory
        key={JSON.stringify(sp)}
        initialTransactions={transactions ?? []}
        initialTotalCount={count ?? 0}
        initialPage={currentPage}
        searchParams={sp}
        subAccountIds={subAccountIds}
      />
    </div>
  );
}
```

- [ ] **Step 2: Delete the old TransactionList**

Remove `src/components/features/transaction-list.tsx`

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/transactions/page.tsx
git rm src/components/features/transaction-list.tsx
git commit -m "feat: redesign transactions page with table layout and Load More"
```

---

### Task 9: Self-Review & Final Verification

- [ ] **Step 1: Verify full TypeScript pass**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build` or `next build`
Expected: Build succeeds

- [ ] **Step 3: Verify no dangling imports**

Check that nothing still imports from `transaction-list.tsx`:
Run: `rg "transaction-list" src/`
Expected: No results (file was deleted)

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "chore: cleanup after transactions page redesign"
```
