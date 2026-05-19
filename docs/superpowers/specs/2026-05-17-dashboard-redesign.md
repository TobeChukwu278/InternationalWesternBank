# Dashboard Page Redesign

Align the dashboard page with the Stitch design spec for International Western Bank.

## Architecture

### Component Tree

```
page.tsx (server)
├── DashboardHeader       — "Welcome, {name}" + notifications bell + settings gear
├── BalanceCard (updated) — Net Worth with trend indicator + account number + copy + hide/show
├── AccountCards (new)    — Checking + Savings cards with balances
├── SpendingInsights (new)— Pie chart (CSS conic-gradient) by category
├── QuickActions (updated)— Send, Request, Deposit (Material Icons)
├── RecentTransactions    — Rewritten with CategoryIcon + merchant names
└── PromotionCard (new)   — "International Travel?" upgrade banner (decorative static)
```

### Data Flow

Server component fetches all data and passes as props — no client-side fetching for dashboard.

**Queries:**

| # | Query | Purpose |
|---|-------|---------|
| 1 | `profiles` + `accounts` + `sub_accounts` | User name, balances, account numbers |
| 2 | `transactions` (last 5) ordered by `created_at` desc | Recent transactions |
| 3 | `transactions` this month, outgoing only (incoming to sub-account excluded), aggregated by `category` | Spending Insights pie chart |
| 4 | `transactions` this month — incoming vs outgoing totals | Trend % calculation |

**Trend calculation:**

```
netChange = incomingThisMonth - outgoingThisMonth
startBalance = totalBalance - netChange
trendPercent = (netChange / startBalance) * 100
```

If `startBalance <= 0`, trend is displayed as "—" (no meaningful percentage).

## Components

### page.tsx (modified)

Server component at `src/app/(dashboard)/dashboard/page.tsx`.

Fetches:
- User profile (full_name)
- Account + sub_accounts (id, type, balance, is_default, account_number from parent)
- Last 5 transactions (`merchant_name`, `category`, `description`, `amount`, `type`, `status`, `created_at`, `reference`)
- Monthly spending aggregation: sum of `amount` grouped by `category` for outgoing transactions where `from_sub_account_id` is in user's sub-accounts and `created_at` is within current month
- Monthly incoming/outgoing totals for trend calculation

Passes all data as props to client components.

### BalanceCard (modified)

File: `src/components/features/balance-card.tsx`

Changes:
- Add `account_balance_wallet` Material Icon at top-left
- Change label from "Total Balance" to "Total Net Worth"
- Add trend line: `trending_up` icon + "+X.X% this month" in `text-iwb-teal` below the balance
- Trend is hidden when balance is hidden (respects `BalanceDisplay` blur)
- Keep existing: account number, copy button, hide/show toggle, hide account icon

**Props:** Same + `trendPercent: number | null`

### AccountCards (new)

File: `src/components/features/account-cards.tsx`

"Accounts" heading with "View All" link to `/accounts`.

Two sub-account cards:
- Sub-account type icon (Material Icon: `account_balance` for checking, `savings` for savings) in a colored circle
- Sub-account type label (Checking / Savings)
- Masked account number (last 4 digits with `*` prefix)
- Balance with hide/show support (uses `BalanceDisplay`)

**Props:**
```tsx
interface AccountCardsProps {
  subAccounts: {
    id: string;
    type: string;
    balance: number;
    accountNumber: string;
  }[];
}
```

### SpendingInsights (new)

File: `src/components/features/spending-insights.tsx`

"Spending Insights" heading. CSS conic-gradient pie chart (`background: conic-gradient(...)`) with color legend below.

Categories and their colors:
| Category    | Color         |
|-------------|---------------|
| shopping    | `#0A2540`     |
| dining      | `#00D4AA`     |
| travel      | `#768DAD`     |
| utilities   | `#BA1A1A`     |
| investment  | `#00D4AA`     |
| other       | `#E0E3E6`     |

Each legend item shows category label + percentage. Only categories with spending > 0 are shown.

If no spending this month, show EmptyState.

**Props:**
```tsx
interface SpendingInsightsProps {
  spendingByCategory: { category: string; amount: number; percentage: number }[];
}
```

### QuickActions (modified)

File: `src/components/features/quick-actions.tsx`

Reduce from 4 to 3 actions:
| Label     | Icon               | Href                |
|-----------|---------------------|----------------------|
| Send      | `send`              | `/send`              |
| Request   | `request_quote`     | `/send?type=request` |
| Deposit   | `camera_alt`        | `/deposit`           |

Replace SVG icons with `<i className="material-icons text-xl">icon_name</i>`.

### RecentTransactions (rewritten)

File: `src/components/features/recent-transactions.tsx`

Rewrite to use `CategoryIcon` component instead of inline SVG by type. Row layout:
- `CategoryIcon` component (category-based colored circle with Material Icon)
- Merchant name (`tx.merchant_name || tx.description || "Transaction"`)
- Relative time ("Today", "Yesterday", "X days ago", or date)
- Amount (right-aligned, green for incoming, navy for outgoing, with +/- prefix)

Link to `/transactions` via "View all" link in header.

### PromotionCard (new)

File: `src/components/features/promotion-card.tsx`

Static decorative card:
- Teal-tinted background (`bg-iwb-teal/5`)
- "International Travel?" heading
- "Unlock zero FX fees and worldwide lounge access with IWB Premier." description
- "Upgrade Now" button (non-functional, decorative)

Does not link anywhere — purely decorative for visual polish.

### DashboardHeader (inline in page.tsx)

No separate file. Inline section in page.tsx:
- "Welcome, {name}" heading
- "Here is your wealth overview today." subtitle
- Notifications bell (`notifications` Material Icon, decorative `<button>`, right-aligned)
- Settings gear (`settings` Material Icon, links to `/settings`)

## Files Changed

| File | Change |
|------|--------|
| `src/app/(dashboard)/dashboard/page.tsx` | Rewrite — add new queries, all new component imports |
| `src/components/features/balance-card.tsx` | Add trend indicator, update labels |
| `src/components/features/account-cards.tsx` | **New** — sub-account breakdown |
| `src/components/features/spending-insights.tsx` | **New** — pie chart + legend |
| `src/components/features/quick-actions.tsx` | 3 actions, Material Icons |
| `src/components/features/recent-transactions.tsx` | Rewrite — CategoryIcon, merchants |
| `src/components/features/promotion-card.tsx` | **New** — decorative upgrade banner |

## Scope Notes

- Notifications bell and settings gear are in the page content area, not in the sidebar/header bar
- Quick Actions use Material Icons matching the Stitch design: `send`, `request_quote`, `camera_alt`
- Promotion card is purely decorative — no tracking, no functionality
- Spending insights only calculates from this month's outgoing transactions
- Trend is calculated on the server side and passed as a prop
- All new components are server-compatible (no client hooks needed unless using BalanceDisplay for hide/show)
- AccountCards uses BalanceDisplay for hide/show consistency
