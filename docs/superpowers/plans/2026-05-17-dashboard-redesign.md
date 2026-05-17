# Dashboard Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the dashboard to match the Stitch design with sub-account breakdown, spending insights, rich recent transactions, Material Icons, trend indicator, and decorative promotion card.

**Architecture:** Server component fetches all data (profile, accounts, transactions, monthly aggregates) and passes as props to client components. All new components are server-compatible. Trend % is calculated server-side.

**Tech Stack:** Next.js 16 App Router, Supabase (server client), Material Icons (Google Fonts CDN, already loaded), Tailwind CSS v4, CSS conic-gradient for pie chart.

---

### Task 1: Update BalanceCard Component

**Files:**
- Modify: `src/components/features/balance-card.tsx`

- [ ] **Step 1: Read the current BalanceCard**

Read `/home/tobe/personal/InternationalWesternBank/src/components/features/balance-card.tsx` to see the current implementation.

- [ ] **Step 2: Rewrite BalanceCard**

Add `trendPercent` prop, Material Icon, trend line. Replace SVG with Material Icon in the bottom-right.

```tsx
import { CopyButton } from "@/components/ui/copy-button";
import { BalanceDisplay } from "@/components/ui/balance-display";

interface BalanceCardProps {
  totalBalance: number;
  accountNumber: string;
  trendPercent: number | null;
}

export function BalanceCard({ totalBalance, accountNumber, trendPercent }: BalanceCardProps) {
  return (
    <div className="rounded-iwb-xl bg-iwb-navy p-6 text-white shadow-iwb-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-iwb-slate-light">Total Net Worth</p>
        <span className="flex size-10 items-center justify-center rounded-full bg-white/10">
          <i className="material-icons text-iwb-teal">account_balance_wallet</i>
        </span>
      </div>
      <p className="mt-2 text-4xl font-bold tracking-tight">
        <BalanceDisplay amount={totalBalance} className="text-4xl" />
      </p>
      {trendPercent !== null ? (
        <p className="mt-1 flex items-center gap-1 text-sm text-iwb-teal">
          <i className="material-icons text-base">trending_up</i>
          +{trendPercent.toFixed(1)}% this month
        </p>
      ) : null}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-xs text-iwb-slate-light">Account Number</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="font-mono text-sm tracking-wider">{accountNumber}</span>
            <CopyButton text={accountNumber} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/features/balance-card.tsx
git commit -m "feat: update BalanceCard with trend indicator and Material Icons"
```

---

### Task 2: Update QuickActions Component

**Files:**
- Modify: `src/components/features/quick-actions.tsx`

- [ ] **Step 1: Read the current QuickActions**

Read `/home/tobe/personal/InternationalWesternBank/src/components/features/quick-actions.tsx`.

- [ ] **Step 2: Rewrite QuickActions**

Reduce to 3 actions with Material Icons:

```tsx
import Link from "next/link";

const quickActions = [
  {
    label: "Send",
    href: "/send",
    icon: "send",
  },
  {
    label: "Request",
    href: "/send?type=request",
    icon: "request_quote",
  },
  {
    label: "Deposit",
    href: "/deposit",
    icon: "camera_alt",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {quickActions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex flex-col items-center gap-2 rounded-iwb-lg bg-white p-4 shadow-iwb-card transition-all duration-200 hover:shadow-iwb-overlay hover:-translate-y-0.5"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
            <i className="material-icons text-xl">{action.icon}</i>
          </span>
          <span className="text-xs font-semibold text-iwb-navy">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/features/quick-actions.tsx
git commit -m "feat: update QuickActions with Material Icons and 3 actions"
```

---

### Task 3: Create SpendingInsights Component

**Files:**
- Create: `src/components/features/spending-insights.tsx`

- [ ] **Step 1: Create the SpendingInsights component**

CSS conic-gradient pie chart with legend:

```tsx
import { EmptyState } from "@/components/ui/empty-state";

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
}

interface SpendingInsightsProps {
  spendingByCategory: SpendingCategory[];
}

const categoryColors: Record<string, string> = {
  shopping: "#0A2540",
  dining: "#00D4AA",
  travel: "#768DAD",
  utilities: "#BA1A1A",
  investment: "#00D4AA",
  other: "#E0E3E6",
};

const categoryLabels: Record<string, string> = {
  shopping: "Shopping",
  dining: "Dining",
  travel: "Travel",
  utilities: "Utilities",
  investment: "Investment",
  other: "Others",
};

export function SpendingInsights({ spendingByCategory }: SpendingInsightsProps) {
  if (spendingByCategory.length === 0) {
    return (
      <div className="rounded-iwb-lg bg-white p-6 shadow-iwb-card">
        <h3 className="mb-4 text-sm font-semibold text-iwb-navy">Spending Insights</h3>
        <EmptyState
          title="No spending this month"
          description="Your spending breakdown will appear here"
        />
      </div>
    );
  }

  const sorted = [...spendingByCategory].sort((a, b) => b.percentage - a.percentage);
  const gradientParts = sorted
    .filter((c) => c.percentage > 0)
    .map((c, i, arr) => {
      const start = arr.slice(0, i).reduce((s, x) => s + x.percentage, 0);
      const end = start + c.percentage;
      const color = categoryColors[c.category] ?? categoryColors.other;
      return `${color} ${start}% ${end}%`;
    });
  const conicGradient = gradientParts.length > 0
    ? `conic-gradient(${gradientParts.join(", ")})`
    : undefined;

  return (
    <div className="rounded-iwb-lg bg-white p-6 shadow-iwb-card">
      <h3 className="mb-4 text-sm font-semibold text-iwb-navy">Spending Insights</h3>
      <div className="flex items-center gap-6">
        <div
          className="size-28 shrink-0 rounded-full"
          style={{ background: conicGradient }}
        />
        <div className="space-y-2">
          {sorted.map((c) => (
            <div key={c.category} className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: categoryColors[c.category] ?? categoryColors.other }}
              />
              <span className="text-xs text-iwb-slate">
                {categoryLabels[c.category] ?? c.category}
              </span>
              <span className="text-xs font-medium text-iwb-navy">
                {c.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
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
git add src/components/features/spending-insights.tsx
git commit -m "feat: add SpendingInsights component with CSS pie chart"
```

---

### Task 4: Create AccountCards Component

**Files:**
- Create: `src/components/features/account-cards.tsx`

- [ ] **Step 1: Create the AccountCards component**

Two sub-account cards with BalanceDisplay for hide/show:

```tsx
import Link from "next/link";
import { BalanceDisplay } from "@/components/ui/balance-display";

interface SubAccountInfo {
  id: string;
  type: string;
  balance: number;
  accountNumber: string;
}

interface AccountCardsProps {
  subAccounts: SubAccountInfo[];
}

const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
  checking: { label: "Checking", icon: "account_balance", color: "bg-iwb-navy/10 text-iwb-navy" },
  savings: { label: "Savings", icon: "savings", color: "bg-iwb-teal/10 text-iwb-teal" },
};

function maskAccountNumber(accountNumber: string): string {
  return "*" + accountNumber.slice(-4);
}

export function AccountCards({ subAccounts }: AccountCardsProps) {
  return (
    <div className="rounded-iwb-lg bg-white p-6 shadow-iwb-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-iwb-navy">Accounts</h3>
        <Link
          href="/accounts"
          className="text-xs font-medium text-iwb-teal transition-colors hover:text-iwb-teal-dark"
        >
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {subAccounts.map((sa) => {
          const config = typeConfig[sa.type] ?? { label: sa.type, icon: "account_balance", color: "bg-iwb-surface text-iwb-slate" };
          return (
            <div
              key={sa.id}
              className="flex items-center gap-4 rounded-iwb-lg border border-iwb-border-light p-4 transition-colors hover:bg-iwb-surface"
            >
              <span className={`flex size-10 items-center justify-center rounded-full ${config.color}`}>
                <i className="material-icons">{config.icon}</i>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-iwb-navy">{config.label}</p>
                <p className="text-xs text-iwb-slate">{maskAccountNumber(sa.accountNumber)}</p>
              </div>
              <BalanceDisplay amount={sa.balance} className="text-sm font-semibold" />
            </div>
          );
        })}
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
git add src/components/features/account-cards.tsx
git commit -m "feat: add AccountCards component with sub-account breakdown"
```

---

### Task 5: Create PromotionCard Component

**Files:**
- Create: `src/components/features/promotion-card.tsx`

- [ ] **Step 1: Create the PromotionCard component**

Static decorative upgrade banner:

```tsx
export function PromotionCard() {
  return (
    <div className="flex items-center justify-between rounded-iwb-lg bg-iwb-teal/5 p-6">
      <div>
        <h3 className="text-lg font-semibold text-iwb-navy">International Travel?</h3>
        <p className="mt-1 text-sm text-iwb-slate">
          Unlock zero FX fees and worldwide lounge access with IWB Premier.
        </p>
      </div>
      <button className="shrink-0 rounded-iwb-md bg-iwb-navy px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
        Upgrade Now
      </button>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/features/promotion-card.tsx
git commit -m "feat: add PromotionCard decorative upgrade banner"
```

---

### Task 6: Rewrite RecentTransactions Component

**Files:**
- Modify: `src/components/features/recent-transactions.tsx`

- [ ] **Step 1: Read the current RecentTransactions**

Read `/home/tobe/personal/InternationalWesternBank/src/components/features/recent-transactions.tsx`.

- [ ] **Step 2: Rewrite RecentTransactions**

Use CategoryIcon, merchant names, relative time:

```tsx
import type { Transaction } from "@/types/database";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryIcon } from "@/components/features/category-icon";

function formatRelativeTime(dateStr: string) {
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
  subAccountIds: string[];
}

function isIncoming(tx: Transaction, subAccountSet: Set<string>): boolean {
  const isOutgoing = tx.from_sub_account_id && subAccountSet.has(tx.from_sub_account_id);
  const isIncomingTx = tx.to_sub_account_id && subAccountSet.has(tx.to_sub_account_id);
  if (isOutgoing && !isIncomingTx) return false;
  return true;
}

export function RecentTransactions({ transactions, subAccountIds }: RecentTransactionsProps) {
  const subAccountSet = new Set(subAccountIds);

  if (!transactions.length) {
    return (
      <div className="rounded-iwb-lg bg-white shadow-iwb-card">
        <div className="flex items-center justify-between border-b border-iwb-border-light px-6 py-4">
          <h3 className="text-sm font-semibold text-iwb-navy">Recent Transactions</h3>
        </div>
        <EmptyState
          title="No transactions yet"
          description="Your transactions will appear here"
        />
      </div>
    );
  }

  return (
    <div className="rounded-iwb-lg bg-white shadow-iwb-card">
      <div className="flex items-center justify-between border-b border-iwb-border-light px-6 py-4">
        <h3 className="text-sm font-semibold text-iwb-navy">Recent Transactions</h3>
        <a href="/transactions" className="text-xs font-medium text-iwb-teal hover:text-iwb-teal-dark transition-colors">
          View All
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
                <p className="text-xs text-iwb-slate">{formatRelativeTime(tx.created_at)}</p>
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
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/features/recent-transactions.tsx
git commit -m "feat: rewrite RecentTransactions with CategoryIcon and merchant names"
```

---

### Task 7: Rewrite Dashboard Page

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Read the current dashboard page**

Read `/home/tobe/personal/InternationalWesternBank/src/app/(dashboard)/dashboard/page.tsx`.

- [ ] **Step 2: Rewrite page.tsx**

Full rewrite with all queries and component wiring:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BalanceCard } from "@/components/features/balance-card";
import { QuickActions } from "@/components/features/quick-actions";
import { AccountCards } from "@/components/features/account-cards";
import { SpendingInsights } from "@/components/features/spending-insights";
import { RecentTransactions } from "@/components/features/recent-transactions";
import { PromotionCard } from "@/components/features/promotion-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(*)")
    .eq("user_id", user.id)
    .single();

  if (!account) redirect("/login");

  const subAccounts = account.sub_accounts ?? [];
  const totalBalance = subAccounts.reduce(
    (sum: number, sa: { balance: number }) => sum + Number(sa.balance),
    0,
  );

  const subAccountIds = subAccounts.map((sa: { id: string }) => sa.id);

  // Recent transactions
  const { data: recentTxs } = await supabase
    .from("transactions")
    .select("*")
    .or(
      `from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  // Monthly spending aggregation (outgoing only)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const { data: thisMonthTxs } = await supabase
    .from("transactions")
    .select("category, amount, from_sub_account_id, to_sub_account_id")
    .or(
      `from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`,
    )
    .gte("created_at", startOfMonth.toISOString())
    .lt("created_at", startOfNextMonth.toISOString());

  // Calculate trend
  let incomingThisMonth = 0;
  let outgoingThisMonth = 0;
  const categoryTotals: Record<string, number> = {};

  for (const tx of thisMonthTxs ?? []) {
    const isOutgoing = tx.from_sub_account_id && subAccountIds.includes(tx.from_sub_account_id);
    const isIncomingTx = tx.to_sub_account_id && subAccountIds.includes(tx.to_sub_account_id);

    if (isOutgoing && !isIncomingTx) {
      outgoingThisMonth += Number(tx.amount);
      const cat = tx.category ?? "other";
      categoryTotals[cat] = (categoryTotals[cat] ?? 0) + Number(tx.amount);
    } else if (isIncomingTx && !isOutgoing) {
      incomingThisMonth += Number(tx.amount);
    }
  }

  const netChange = incomingThisMonth - outgoingThisMonth;
  const startBalance = totalBalance - netChange;
  const trendPercent = startBalance > 0 ? (netChange / startBalance) * 100 : null;

  const totalSpending = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
  const spendingByCategory = Object.entries(categoryTotals)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-iwb-navy">
            Welcome, {profile?.full_name ?? "User"}
          </h1>
          <p className="mt-1 text-sm text-iwb-slate">
            Here is your wealth overview today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex size-10 items-center justify-center rounded-full bg-white text-iwb-slate-light shadow-iwb-card transition-colors hover:bg-iwb-surface hover:text-iwb-navy"
            title="Notifications"
          >
            <i className="material-icons">notifications</i>
          </button>
          <a
            href="/settings"
            className="flex size-10 items-center justify-center rounded-full bg-white text-iwb-slate-light shadow-iwb-card transition-colors hover:bg-iwb-surface hover:text-iwb-navy"
            title="Settings"
          >
            <i className="material-icons">settings</i>
          </a>
        </div>
      </div>

      <BalanceCard
        totalBalance={totalBalance}
        accountNumber={account.account_number}
        trendPercent={trendPercent}
      />

      <QuickActions />

      <AccountCards
        subAccounts={subAccounts.map((sa: { id: string; type: string; balance: number }) => ({
          id: sa.id,
          type: sa.type,
          balance: Number(sa.balance),
          accountNumber: account.account_number,
        }))}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingInsights spendingByCategory={spendingByCategory} />
        <RecentTransactions
          transactions={recentTxs ?? []}
          subAccountIds={subAccountIds}
        />
      </div>

      <PromotionCard />
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/dashboard/page.tsx
git commit -m "feat: redesign dashboard page with Stitch-aligned components and data flow"
```
