# Deposit Page Redesign

**Goal:** Bring the deposit page up to the same quality and UX standard as the redesigned send money page.

## Changes

### Server Page (`src/app/(dashboard)/deposit/page.tsx`)
- Read `preferredCurrency` from cookies
- Convert sub-account balances from stored currency to `preferredCurrency` using `convertAmount`
- Pass `preferredCurrency` to the form component

### DepositForm (`src/components/features/deposit-form.tsx`) — Rewrite
- Replace generic `Select`/`Input`/`Button` UI components with inline styled elements matching the send page pattern (IWB design tokens, Material Icons)
- Card sections with Material Icons headers (same layout as send: "Deposit Details" card with icon)
- Preferred currency symbol everywhere instead of hardcoded `$`:
  - Sub-account balance display in select dropdown
  - Amount input prefix
  - Quick-amount button labels
  - Button text
- Quick-amount buttons: `+100`, `+500`, `+1000` (in preferred currency) below the amount input
- Success result screen after deposit (replaces form) showing:
  - Green check icon + "Deposit Successful"
  - Amount in preferred currency
  - Reference number
  - "Back to Dashboard" button
  - "View in Accounts" link
- Error state: inline error message box (exists already, keep)
- No receipt download (deposits don't need receipts — send already handles that)

### Server Action (`src/lib/actions/deposit.ts`)
- Generate a reference string (e.g., `DEP{timestamp}{random8}`)
- Return `{ success: true, reference }` instead of `{ success: true }`
- Return `{ success: true, reference, status: "completed" }` for consistency with send pattern

## Architecture
- Server component (page) → pass props to client component (form)
- 2-step state machine in client: `form` → `result`
- No confirmation modal needed (deposit is self-initiated, no review step)
- Success result replaces form content (same pattern as send's result screen)

## Files Changed
- `src/app/(dashboard)/deposit/page.tsx` — add preferredCurrency + balance conversion
- `src/components/features/deposit-form.tsx` — rewrite
- `src/lib/actions/deposit.ts` — add reference to return value
