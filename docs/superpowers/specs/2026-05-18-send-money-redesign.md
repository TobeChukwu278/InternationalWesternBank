# Send Money Redesign

**Date:** 2026-05-18
**Status:** Approved Design
**Stitch Screen Ref:** `Send Money - Desktop`, `Send Money - Mobile`

## Overview

Redesign the send money flow to match the Stitch design spec. Add recent recipients, quick-amount buttons, reference/memo field, confirmation step, schedule toggle, and post-send result screens (success/failure/pending) with receipt download (PNG/PDF).

## Architecture

### Screen Flow

```
Send Form → Confirmation (modal) → Result Screen
                                        ├── Success (receipt + download)
                                        ├── Failure (error + retry)
                                        └── Pending (reference + status badge)
```

### Component Tree

```
app/(dashboard)/send/
├── page.tsx                    ← Server: fetches accounts, sub-accounts, recent recipients
│                                  (query last 10 unique external accounts from transactions)
└── send-form.tsx               ← Client: manages form state (step: form | confirmation | result)
    ├── RecipientSearch         ← Enhanced: recent recipient cards + search + "Add New"
    ├── TransferDetails         ← New: from-account dropdown, amount input + quick-amounts, reference
    ├── ScheduleToggle          ← New: optional "Schedule for later" toggle
    ├── SendConfirmation        ← New: review modal showing all details before submit
    └── SendResult              ← New: success/failure/pending full-screen state
```

### Data Flow

1. **Server (`page.tsx`)** authenticates user, fetches:
   - Accounts + sub_accounts (from-account options)
   - Account number (for receipt display)
   - Preferred currency (from cookie)
   - Recent recipients: last 10 unique accounts the user sent to, joined with profiles for names
2. **Client (`send-form.tsx`)** manages 3-step state:
   - `form`: user fills in recipient, amount, reference
   - `confirmation`: review modal shown
   - `result`: success/failure/pending display
3. **Server action** (`transfer.ts`): executes atomic transfer, returns `{ success, transaction_id }` or `{ error }`
4. **On success**: revalidate dashboard + transactions, show result screen with receipt

## Components

### SendForm (`send-form.tsx`)

State machine with 3 phases:

```tsx
type Step = "form" | "confirmation" | "result";
type Result = { status: "success" | "failure" | "pending"; transaction?: Transaction; error?: string } | null;
```

- Receives: `subAccounts`, `accountNumber`, `recentRecipients`, `preferredCurrency` from server
- Form state: `recipient`, `fromSubAccount`, `amount`, `reference`, `scheduledDate`
- On "Send Money" click → set step to "confirmation"
- On "Confirm" → call server action → set step to "result" with outcome

### RecipientSearch (`recipient-search.tsx`)

Enhanced from current implementation:

- **Recent recipients grid**: Horizontal scrollable list of chips/cards showing:
  - Avatar initial (from profile full_name)
  - Name
  - Masked account number (`**** 8832`)
  - Click to select
- **Search bar**: Filters recipients by name or account number
- **"Add New" button**: Clears selection, shows text search input
- Hidden input `name="recipient"` pattern preserved for form submission

### TransferDetails (`transfer-details.tsx`)

New component containing:

- **From Account**: Select dropdown styled as a card, showing:
  - Account icon (VISA/mastercard-style)
  - Account name + type (`Premium Savings`)
  - Available balance (`$24,500.00`)
- **Amount Input**: 
  - Prefix "$" (or preferred currency symbol)
  - Numeric input, step 0.01, min 0.01
  - Client-side balance validation
- **Quick Amount Buttons**: `+$100`, `+$500`, `+$1,000` — adds to current amount
- **Reference (Optional)**: Text input for memo/note
- **Currency formatting**: Uses `Intl.NumberFormat` with user's preferred currency

### ScheduleToggle (`schedule-toggle.tsx`)

New component:

- Toggle switch: "Schedule for later"
- When toggled on: shows a date picker (native `input type="datetime-local"`)
- Stored as `scheduled_date` — if set, transaction created with "pending" status
- If no schedule: transfer executes immediately (current behavior, "completed" status)

### SendConfirmation (`send-confirmation.tsx`)

Modal overlay with:

| Field | Display |
|-------|---------|
| To | Recipient name + masked account number |
| From | From-account name |
| Amount | Large formatted amount |
| Reference | Note text (if provided) |
| Fees | "$0.00 • Free transfer within IWB" |
| Confirm button | Teal primary |
| Cancel button | Ghost/secondary |

### SendResult (`send-result.tsx`)

Full-screen result display replacing the form:

**Success:**
- Green checkmark icon (Material: `check_circle`)
- "Money Sent!" heading
- Amount formatted in preferred currency
- Recipient name
- Reference number (transaction reference)
- Receipt download buttons: PNG + PDF (reuse `html2canvas` + `jsPDF` from existing `TransactionReceipt`)
- "Back to Dashboard" button

**Failure:**
- Red X icon (Material: `cancel`)
- "Transfer Failed" heading
- Error message from server action
- "Try Again" button (returns to form, preserves inputs)
- "Close" button (navigates to dashboard)

**Pending:**
- Clock icon (Material: `schedule`)
- "Transfer Scheduled" heading
- Reference number
- Status badge: "Pending"
- Scheduled date/time
- Receipt download buttons
- "Back to Dashboard" button

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Initial page load | Skeleton cards for recipient list and transfer details |
| Empty | No recent recipients | "No recent recipients" with search prompt |
| Form filled | User enters data | "Send Money" button becomes active |
| Validation error | Amount > balance | Red error message, button disabled |
| Confirmation | User clicks "Send Money" | Modal overlay with review |
| Submitting | User clicks "Confirm" | Button loading spinner |
| Success | Server action returns success | Green result screen with receipt |
| Failure | Server action returns error | Red result screen with message |
| Pending | Transfer has scheduled date | Clock result screen with reference |

## Stitch Design Reference

Based on "Send Money - Desktop" and "Send Money - Mobile" Stitch screens:

- **Desktop layout**: Single-column card layout within dashboard skeleton sidebar
- **Color scheme**: IWB design tokens (Deep Navy `#0A2540`, Teal `#00D4AA`, Light Gray `#F7F9FC`)
- **Typography**: Inter font, 14px body, 12px labels, 32px/24px headlines
- **Spacing**: 8px rhythm, 24px card padding, 16px between sections
- **Shapes**: 8px button radius, 12px card radius, full pill for status badges
- **Receipt style**: Dashed borders between sections, "Electronically generated" footer

## Out of Scope

- Recurring transfers (repeat weekly/monthly)
- International wire fees and SWIFT/BIC fields
- Multi-recipient batch send
- Push notifications for transfer status
- Email confirmation of transfer
