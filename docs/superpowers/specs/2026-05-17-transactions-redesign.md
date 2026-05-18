# Transactions Page Redesign

Align the transactions page with the Stitch design spec for International Western Bank.

## DB Migration

### New Columns

Add to `transactions` table (run via Supabase Dashboard SQL Editor):

```sql
ALTER TABLE transactions ADD COLUMN merchant_name TEXT;
ALTER TABLE transactions ADD COLUMN category TEXT DEFAULT 'other';

-- Backfill existing rows
UPDATE transactions SET category = 'transfer' WHERE type IN ('transfer', 'internal_transfer');
UPDATE transactions SET category = 'deposit' WHERE type = 'deposit';
UPDATE transactions SET category = 'withdrawal' WHERE type = 'withdrawal';
UPDATE transactions SET merchant_name = description WHERE merchant_name IS NULL;
```

### Category Values

| category       | Material Icon     | Used for                              |
|----------------|-------------------|---------------------------------------|
| `shopping`     | `shopping_bag`    | Retail, electronics, clothing         |
| `dining`       | `restaurant`      | Restaurants, cafes, bars              |
| `travel`       | `flight`          | Airlines, hotels, transport           |
| `utilities`    | `bolt`            | Bills, utilities, subscriptions       |
| `investment`   | `account_balance` | Deposits, dividends, trading          |
| `deposit`      | `account_balance_wallet` | Cash/check deposits          |
| `transfer`     | `send`            | P2P transfers, internal transfers     |
| `withdrawal`   | `money_off`       | ATM withdrawals, cash outs            |
| `other`        | `receipt_long`    | Uncategorized                         |

## Material Icons

### Approach

Load Material Icons via Google Fonts CDN. One stylesheet link in root layout, then use `<i className="material-icons">icon_name</i>` anywhere.

### Steps

1. Add `<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">` to `src/app/layout.tsx`
2. No npm package needed

## API Route

### Endpoint

`GET /api/transactions`

### Query Parameters

| Param      | Type   | Description                              |
|------------|--------|------------------------------------------|
| `page`     | number | Page number (1-indexed, default 1)       |
| `limit`    | number | Items per page (default 15)              |
| `type`     | string | Filter by tx type (deposit/transfer/withdrawal/internal_transfer) |
| `status`   | string | Filter by status (completed/pending/failed) |
| `direction`| string | Filter by direction (incoming/outgoing)   |
| `search`   | string | Search merchant_name, description, reference |
| `category` | string | Filter by category                       |

### Response

```json
{
  "transactions": [...],
  "page": 1,
  "totalPages": 10,
  "totalCount": 142
}
```

The handler authenticates via `createClient()` (cookie-based session), gets user's sub-account IDs, then queries the `transactions` table with the service client filtered to those IDs. Same filtering logic as the current server component.

## Component Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/app/api/transactions/route.ts` | API route handler for paginated fetches |
| `src/app/api/transactions/export/route.ts` | API route handler for CSV export |
| `src/app/(dashboard)/transactions/transaction-history.tsx` | Client component wrapping the full page |
| `src/app/(dashboard)/transactions/transaction-row.tsx` | Single row: date, icon, merchant, category, status, amount |
| `src/components/features/category-icon.tsx` | Maps category string → Material Icon element |

### Modified Files

| File | Change |
|------|--------|
| `src/app/(dashboard)/transactions/page.tsx` | Pass initial data as props to client component, change to `dynamic` |
| `src/app/layout.tsx` | Add Material Icons CDN link |
| `src/components/features/transaction-list.tsx` | Remove, replaced by transaction-history.tsx |

### Data Flow

1. Server component (`page.tsx`) fetches page 1 with SSR, passes to `TransactionHistory`
2. `TransactionHistory` renders the table + "Load More" button
3. On "Load More": fetch `GET /api/transactions?page=N&...`, append results
4. On filter change: full page reload via `<a>` links and `<form>` submit (current behavior retained)
5. On "Export CSV": server action generates CSV, triggers browser download

### Layout Changes

**Current:**
```
[Heading & Subtitle]
[Filter pills + Search input]
[Transaction rows with type icon, description, date, amount, status]
[Pagination: page numbers + prev/next]
```

**New:**
```
[Total Assets badge]
[Transaction History heading]
[Filter row: date dropdown, category dropdown, status dropdown, Advanced pill]
[Search input + Notifications bell + Export CSV button]
[Table header: Date | Merchant | Category | Status | Amount]
[Transaction rows with category icon, merchant name, category label, status pill, amount]
[Showing X-Y of Z transactions]
[Load More Transactions button]
```

## Export CSV

### API Route

`GET /api/transactions/export?type=...&status=...&search=...`

Accepts the same filter params as the main API route. Queries all matching transactions (no pagination limit) and returns a CSV file download with `Content-Type: text/csv`.

The "Export CSV" button navigates to this URL, triggering the browser download.

## Implementation Order

Run DB migration first (via SQL Editor), then implement in this order:

1. `src/app/layout.tsx` — add Material Icons CDN
2. `src/app/api/transactions/route.ts` — API endpoint
3. `src/components/features/category-icon.tsx` — icon mapper
4. `src/components/features/export-csv-actions.ts` — CSV export
5. `src/app/(dashboard)/transactions/transaction-row.tsx` — row component
6. `src/app/(dashboard)/transactions/transaction-history.tsx` — page client wrapper
7. `src/app/(dashboard)/transactions/page.tsx` — update to use new components

## Scope Notes

- Material Icons loaded via CDN (one `link` tag in `<head>`)
- API route uses service client (bypasses RLS) — safe since transactions are filtered by sub-account ownership server-side
- Existing filter pills (All, Sent, Received, etc.) stay but are repositioned into dropdown controls
- The search input and filter bar merge: top search replaces the current inline search
- Notifications bell is decorative (no functionality)
- "Advanced" button is decorative (no additional filter panel)
