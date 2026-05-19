# Send Money Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the send money flow matching Stitch design — recent recipients, quick amounts, reference field, confirmation step, schedule toggle, and post-send result screens (success/failure/pending) with receipt download.

**Architecture:** Server component fetches accounts + recent recipients, passes to client `SendForm` which manages a 3-step state machine (form → confirmation → result). Confirmation is a modal; result replaces the form content. Existing `transfer_money` RPC handles instant transfers; scheduled transfers insert pending records directly.

**Tech Stack:** Next.js 16 App Router, Supabase (Postgres + Auth), html2canvas + jspdf (receipt download), Material Icons, Tailwind CSS v4, Intl.NumberFormat

---

### Task 1: DB Migration — Add scheduled_date to Transactions

**Files:**
- Create: `supabase/migrations/00009_scheduled_transfers.sql`

- [ ] **Step 1: Create migration**

```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ;
```

- [ ] **Step 2: Update types in `src/types/database.ts`**

Add `scheduled_date` to the `Transaction` interface:

```ts
export interface Transaction {
  id: string;
  from_sub_account_id: string | null;
  to_sub_account_id: string | null;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  reference: string;
  description: string | null;
  merchant_name: string | null;
  category: string | null;
  created_at: string;
  scheduled_date: string | null;
}
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00009_scheduled_transfers.sql src/types/database.ts
git commit -m "feat: add scheduled_date to transactions"
```

---

### Task 2: Update Server Action — Add Scheduling + Return Transaction Data

**Files:**
- Modify: `src/lib/actions/transfer.ts`

- [ ] **Step 1: Rewrite `sendMoney` to handle scheduled transfers and return transaction_id**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function generateReference(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 8; i++) random += chars.charAt(Math.floor(Math.random() * chars.length));
  return `TXN${Date.now()}${random}`;
}

export async function sendMoney(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const recipient = formData.get("recipient") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const fromSubAccount = formData.get("from_sub_account") as string;
  const description = (formData.get("description") as string) || null;
  const scheduledDate = (formData.get("scheduled_date") as string) || null;

  if (!recipient || !amount || !fromSubAccount) return { error: "Missing required fields" };
  if (isNaN(amount) || amount <= 0) return { error: "Invalid amount" };

  // Verify sender owns the sub-account
  const { data: senderSub } = await supabase
    .from("sub_accounts")
    .select("balance")
    .eq("id", fromSubAccount)
    .eq("account_id", (await supabase.from("accounts").select("id").eq("user_id", user.id).single()).data?.id ?? "")
    .single();

  if (!senderSub) return { error: "Invalid source account" };
  if (senderSub.balance < amount) return { error: "Insufficient funds" };

  // Find recipient's default sub-account
  const svc = createServiceClient();
  const { data: recipientAccount } = await svc
    .from("accounts")
    .select("id")
    .eq("account_number", recipient)
    .single();

  if (!recipientAccount) return { error: "Recipient not found" };

  const { data: recipientSub } = await svc
    .from("sub_accounts")
    .select("id")
    .eq("account_id", recipientAccount.id)
    .eq("is_default", true)
    .single();

  if (!recipientSub) return { error: "Recipient has no active account" };

  const reference = generateReference();

  if (scheduledDate) {
    // Scheduled transfer — insert pending record
    const { data: tx, error } = await supabase
      .from("transactions")
      .insert({
        from_sub_account_id: fromSubAccount,
        to_sub_account_id: recipientSub.id,
        amount,
        status: "pending",
        type: "transfer",
        reference,
        description,
        scheduled_date: scheduledDate,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    revalidatePath("/dashboard", "layout");
    revalidatePath("/transactions", "layout");

    return { success: true, transaction_id: tx.id, reference, status: "pending" };
  }

  // Instant transfer — use atomic RPC
  const { data: result, error } = await supabase.rpc("transfer_money", {
    p_from_sub_account_id: fromSubAccount,
    p_to_sub_account_id: recipientSub.id,
    p_amount: amount,
    p_reference: reference,
    p_description: description,
  });

  if (error) return { error: error.message };
  if (result?.error) return { error: result.error };

  revalidatePath("/dashboard", "layout");
  revalidatePath("/transactions", "layout");

  return {
    success: true,
    transaction_id: result.transaction_id,
    reference,
    status: "completed",
  };
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/transfer.ts
git commit -m "feat: add scheduled transfer support to sendMoney action"
```

---

### Task 3: Update Server Page — Fetch Recent Recipients + Pass More Data

**Files:**
- Modify: `src/app/(dashboard)/send/page.tsx`
- Create: `src/app/(dashboard)/send/send-form.tsx` (placeholder)

- [ ] **Step 1: Rewrite page.tsx**

```tsx
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SendForm } from "./send-form";

export default async function SendPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const preferredCurrency = cookieStore.get("preferred_currency")?.value ?? "USD";

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(*)")
    .eq("user_id", user.id)
    .single();

  if (!account) redirect("/login");

  const subAccounts = account.sub_accounts as {
    id: string;
    type: string;
    balance: number;
    currency: string;
    is_default: boolean;
  }[];

  const subAccountIds = subAccounts.map((sa) => sa.id);

  // Fetch recent transfer recipients
  const svc = createServiceClient();
  const { data: recentTx } = await svc
    .from("transactions")
    .select("to_sub_account_id")
    .in("from_sub_account_id", subAccountIds)
    .eq("type", "transfer")
    .eq("status", "completed")
    .not("to_sub_account_id", "is", null)
    .order("created_at", { ascending: false });

  const recipientSubIds = [
    ...new Set(
      (recentTx ?? [])
        .map((tx) => tx.to_sub_account_id as string)
        .filter((id) => !subAccountIds.includes(id)),
    ),
  ].slice(0, 10);

  type RecipientInfo = { account_number: string; full_name: string };
  let recentRecipients: RecipientInfo[] = [];

  if (recipientSubIds.length > 0) {
    const { data: subs } = await svc
      .from("sub_accounts")
      .select("accounts!inner(account_number, profiles!inner(full_name))")
      .in("id", recipientSubIds);

    recentRecipients = (subs ?? []).map((s: any) => ({
      account_number: s.accounts.account_number,
      full_name: s.accounts.profiles.full_name,
    }));
  }

  return (
    <SendForm
      subAccounts={subAccounts.map((sa) => ({
        id: sa.id,
        type: sa.type,
        balance: Number(sa.balance),
        is_default: sa.is_default,
      }))}
      accountNumber={account.account_number}
      recentRecipients={recentRecipients}
      preferredCurrency={preferredCurrency}
    />
  );
}
```

- [ ] **Step 2: Create placeholder SendForm stub**

```tsx
"use client";

interface SendFormProps {
  subAccounts: { id: string; type: string; balance: number; is_default: boolean }[];
  accountNumber: string;
  recentRecipients: { account_number: string; full_name: string }[];
  preferredCurrency: string;
}

export function SendForm(_props: SendFormProps) {
  return null;
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/send/page.tsx src/app/\(dashboard\)/send/send-form.tsx
git commit -m "feat: update send page with recent recipients query and SendForm shell"
```

---

### Task 4: Enhance RecipientSearch — Recent Recipients Grid + Search

**Files:**
- Modify: `src/components/features/recipient-search.tsx`

- [ ] **Step 1: Rewrite component with recent recipients grid**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface SearchResult {
  account_number: string;
  full_name: string;
}

interface RecipientSearchProps {
  recentRecipients: { account_number: string; full_name: string }[];
  onSelect: (recipient: { accountNumber: string; fullName: string }) => void;
  selected: { accountNumber: string; fullName: string } | null;
}

export function RecipientSearch({ recentRecipients, onSelect, selected }: RecipientSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    fetch(`/api/recipients?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setResults(data.recipients ?? []);
        setShowDropdown(true);
      })
      .catch(() => {})
      .finally(() => setSearching(false));
    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(r: { account_number: string; full_name: string }) {
    onSelect({ accountNumber: r.account_number, fullName: r.full_name });
    setQuery("");
    setShowDropdown(false);
    setShowAddNew(false);
  }

  function handleClear() {
    onSelect({ accountNumber: "", fullName: "" });
    setQuery("");
    setResults([]);
  }

  if (selected && selected.accountNumber) {
    return (
      <div className="flex items-center justify-between rounded-iwb-lg border border-iwb-teal/30 bg-iwb-teal/5 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-iwb-teal/10 text-sm font-bold text-iwb-teal">
            {selected.fullName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-medium text-iwb-navy">{selected.fullName}</p>
            <p className="text-xs text-iwb-slate">**** {selected.accountNumber.slice(-4)}</p>
          </div>
        </div>
        <button onClick={handleClear} className="text-xs text-iwb-slate-light hover:text-iwb-error transition-colors">
          Change
        </button>
      </div>
    );
  }

  return (
    <div>
      {!showAddNew && recentRecipients.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider mb-3">Recent Recipients</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {recentRecipients.map((r) => (
              <button
                key={r.account_number}
                onClick={() => handleSelect(r)}
                className="flex items-center gap-2 rounded-iwb-lg border border-iwb-border-light p-3 transition-all hover:border-iwb-teal hover:bg-iwb-teal/5 text-left"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-iwb-navy/5 text-xs font-bold text-iwb-slate">
                  {r.full_name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium text-iwb-navy">{r.full_name}</p>
                  <p className="text-xs text-iwb-slate-light">**** {r.account_number.slice(-4)}</p>
                </div>
              </button>
            ))}
            <button
              onClick={() => setShowAddNew(true)}
              className="flex items-center gap-2 rounded-iwb-lg border border-dashed border-iwb-border p-3 transition-all hover:border-iwb-teal hover:bg-iwb-teal/5 text-left"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
                <i className="material-icons text-sm">add</i>
              </span>
              <div>
                <p className="text-sm font-medium text-iwb-navy">Add New</p>
                <p className="text-xs text-iwb-slate-light">Search by account</p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-2 rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 focus-within:border-iwb-teal focus-within:ring-2 focus-within:ring-iwb-teal/10 transition-colors">
            <i className="material-icons text-iwb-slate-light">search</i>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by account number..."
              className="flex-1 bg-transparent text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:outline-none"
            />
            {searching ? (
              <span className="size-4 animate-spin rounded-full border-2 border-iwb-teal border-t-transparent" />
            ) : null}
          </div>

          {showDropdown && results.length > 0 ? (
            <div
              ref={dropdownRef}
              className="absolute z-10 mt-1 w-full rounded-iwb-lg bg-white shadow-iwb-overlay border border-iwb-border-light max-h-60 overflow-y-auto"
            >
              {results.map((r) => (
                <button
                  key={r.account_number}
                  onClick={() => handleSelect(r)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-iwb-surface"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-iwb-navy/5 text-xs font-bold text-iwb-slate">
                    {r.full_name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-iwb-navy">{r.full_name}</p>
                    <p className="text-xs text-iwb-slate-light">{r.account_number}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : showDropdown && query.length >= 2 ? (
            <div className="absolute z-10 mt-1 w-full rounded-iwb-lg bg-white shadow-iwb-overlay border border-iwb-border-light p-4 text-center text-sm text-iwb-slate">
              No recipients found
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

- [ ] **Step 3: Commit**

```bash
git add src/components/features/recipient-search.tsx
git commit -m "feat: enhance RecipientSearch with recent recipients grid and Add New flow"
```

---

### Task 5: Create TransferDetails Component

**Files:**
- Create: `src/app/(dashboard)/send/transfer-details.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

interface SubAccountOption {
  id: string;
  type: string;
  balance: number;
  is_default: boolean;
}

interface TransferDetailsProps {
  subAccounts: SubAccountOption[];
  fromAccount: string;
  onFromAccountChange: (id: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  reference: string;
  onReferenceChange: (value: string) => void;
  exceedsBalance: boolean;
  preferredCurrency: string;
}

const QUICK_AMOUNTS = [100, 500, 1000];

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
};

export function TransferDetails({
  subAccounts,
  fromAccount,
  onFromAccountChange,
  amount,
  onAmountChange,
  reference,
  onReferenceChange,
  exceedsBalance,
  preferredCurrency,
}: TransferDetailsProps) {
  const symbol = currencySymbols[preferredCurrency] ?? "$";
  const selected = subAccounts.find((sa) => sa.id === fromAccount);

  function addQuickAmount(val: number) {
    const current = parseFloat(amount) || 0;
    onAmountChange(String(current + val));
  }

  return (
    <div className="space-y-5">
      {/* From Account */}
      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">From Account</label>
        <div className="mt-2 relative">
          <select
            value={fromAccount}
            onChange={(e) => onFromAccountChange(e.target.value)}
            className="w-full appearance-none rounded-iwb-lg border border-iwb-border bg-white px-4 py-3.5 pr-10 text-sm text-iwb-navy focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
          >
            {subAccounts.map((sa) => (
              <option key={sa.id} value={sa.id}>
                {sa.type.charAt(0).toUpperCase() + sa.type.slice(1)} — ${sa.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </option>
            ))}
          </select>
          <i className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-iwb-slate-light pointer-events-none">expand_more</i>
        </div>
        {selected ? (
          <p className="mt-1.5 text-xs text-iwb-slate">
            Available: {symbol}{selected.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        ) : null}
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Amount</label>
        <div className="mt-2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-iwb-navy">
            {symbol}
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className="w-full rounded-iwb-lg border border-iwb-border bg-white py-3.5 pl-10 pr-4 text-lg font-semibold text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
          />
        </div>
        {exceedsBalance ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-iwb-error">
            <i className="material-icons text-sm">error</i>
            Amount exceeds available balance
          </p>
        ) : null}
        <div className="mt-2 flex gap-2">
          {QUICK_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => addQuickAmount(val)}
              className="rounded-iwb-md border border-iwb-border-light px-3 py-1.5 text-xs font-medium text-iwb-slate transition-colors hover:border-iwb-teal hover:text-iwb-teal"
            >
              +{symbol}{val.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Reference */}
      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Reference (Optional)</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => onReferenceChange(e.target.value)}
          placeholder="Add a note or memo..."
          maxLength={200}
          className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/send/transfer-details.tsx
git commit -m "feat: add TransferDetails component with quick-amount buttons"
```

---

### Task 6: Create ScheduleToggle Component

**Files:**
- Create: `src/app/(dashboard)/send/schedule-toggle.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

interface ScheduleToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  date: string;
  onDateChange: (date: string) => void;
}

export function ScheduleToggle({ enabled, onToggle, date, onDateChange }: ScheduleToggleProps) {
  return (
    <div className="rounded-iwb-lg border border-iwb-border-light p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="material-icons text-iwb-slate-light">event_repeat</i>
          <div>
            <p className="text-sm font-medium text-iwb-navy">Schedule for later</p>
            <p className="text-xs text-iwb-slate">Send this transfer automatically in the future</p>
          </div>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            enabled ? "bg-iwb-teal" : "bg-iwb-border"
          }`}
        >
          <span
            className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {enabled ? (
        <div className="mt-4">
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
          />
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/send/schedule-toggle.tsx
git commit -m "feat: add ScheduleToggle component"
```

---

### Task 7: Create SendConfirmation Component

**Files:**
- Create: `src/app/(dashboard)/send/send-confirmation.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

interface SendConfirmationProps {
  recipientName: string;
  recipientAccount: string;
  fromAccountName: string;
  amount: string;
  reference: string;
  preferredCurrency: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const currencySymbols: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", NGN: "₦",
};

export function SendConfirmation({
  recipientName,
  recipientAccount,
  fromAccountName,
  amount,
  reference,
  preferredCurrency,
  onConfirm,
  onCancel,
  loading,
}: SendConfirmationProps) {
  const symbol = currencySymbols[preferredCurrency] ?? "$";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-iwb-navy/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm animate-[fadeIn_200ms_ease-out,slideUp_200ms_ease-out] rounded-iwb-xl bg-white shadow-iwb-overlay">
        <div className="p-6">
          <div className="text-center pb-4 border-b border-dashed border-iwb-border-light">
            <i className="material-icons text-4xl text-iwb-slate-light mb-2">swap_horiz</i>
            <h2 className="text-base font-semibold text-iwb-navy">Review Transfer</h2>
          </div>

          <div className="py-4 space-y-3 border-b border-dashed border-iwb-border-light">
            <div className="flex justify-between items-center">
              <span className="text-xs text-iwb-slate-light">To</span>
              <span className="text-sm font-medium text-iwb-navy">{recipientName} •••• {recipientAccount.slice(-4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-iwb-slate-light">From</span>
              <span className="text-sm font-medium text-iwb-navy">{fromAccountName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-iwb-slate-light">Amount</span>
              <span className="text-xl font-bold text-iwb-navy">
                {symbol}{parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {reference ? (
              <div className="flex justify-between items-center">
                <span className="text-xs text-iwb-slate-light">Reference</span>
                <span className="text-sm text-iwb-navy">{reference}</span>
              </div>
            ) : null}
          </div>

          <div className="py-3 text-center">
            <p className="text-xs text-iwb-slate">
              <i className="material-icons text-xs align-text-bottom">verified_user</i>{" "}
              Fees: $0.00 • Free transfer within IWB
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-iwb-md border-2 border-iwb-border px-4 py-2.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-iwb-md bg-iwb-teal px-4 py-2.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
              ) : null}
              {loading ? "Sending..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/send/send-confirmation.tsx
git commit -m "feat: add SendConfirmation review modal"
```

---

### Task 8: Create SendResult Component

**Files:**
- Create: `src/app/(dashboard)/send/send-result.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Link from "next/link";

type ResultStatus = "success" | "failure" | "pending";

interface SendResultProps {
  status: ResultStatus;
  amount: string;
  recipientName: string;
  reference: string;
  error?: string;
  scheduledDate?: string;
  preferredCurrency: string;
  onRetry: () => void;
  onClose: () => void;
}

const currencySymbols: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", NGN: "₦",
};

const config: Record<ResultStatus, {
  icon: string;
  iconColor: string;
  heading: string;
  headingColor: string;
  borderColor: string;
}> = {
  success: {
    icon: "check_circle",
    iconColor: "text-iwb-teal",
    heading: "Money Sent!",
    headingColor: "text-iwb-teal-dark",
    borderColor: "border-iwb-teal",
  },
  failure: {
    icon: "cancel",
    iconColor: "text-iwb-error",
    heading: "Transfer Failed",
    headingColor: "text-iwb-error",
    borderColor: "border-iwb-error",
  },
  pending: {
    icon: "schedule",
    iconColor: "text-iwb-slate",
    heading: "Transfer Scheduled",
    headingColor: "text-iwb-navy",
    borderColor: "border-iwb-border",
  },
};

export function SendResult({
  status,
  amount,
  recipientName,
  reference,
  error,
  scheduledDate,
  preferredCurrency,
  onRetry,
  onClose,
}: SendResultProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState<string | null>(null);
  const c = config[status];
  const symbol = currencySymbols[preferredCurrency] ?? "$";

  async function captureReceipt(): Promise<HTMLCanvasElement | null> {
    if (!receiptRef.current) return null;
    return html2canvas(receiptRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
  }

  async function downloadPNG() {
    setCapturing("png");
    try {
      const canvas = await captureReceipt();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `receipt-${reference}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setCapturing(null);
    }
  }

  async function downloadPDF() {
    setCapturing("pdf");
    try {
      const canvas = await captureReceipt();
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`receipt-${reference}.pdf`);
    } finally {
      setCapturing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-iwb-xl border-2 ${c.borderColor} bg-white overflow-hidden`}>
        {/* Receipt capture area */}
        <div ref={receiptRef} className="p-8" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
          {/* Header */}
          <div className="text-center border-b border-dashed border-iwb-border-light pb-6">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-iwb-navy">
              <i className="material-icons text-white text-2xl">account_balance</i>
            </div>
            <h2 className="text-lg font-bold text-iwb-navy">International Western Bank</h2>
          </div>

          {/* Status */}
          <div className="py-6 text-center">
            <i className={`material-icons text-5xl ${c.iconColor} mb-2`}>{c.icon}</i>
            <p className={`text-lg font-semibold ${c.headingColor}`}>{c.heading}</p>
          </div>

          {/* Details */}
          <div className="space-y-3 border-t border-dashed border-iwb-border-light pt-5">
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">Amount</span>
              <span className="text-xl font-bold text-iwb-navy">
                {symbol}{parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">Recipient</span>
              <span className="text-sm font-medium text-iwb-navy">{recipientName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-iwb-slate-light">Reference</span>
              <span className="font-mono text-xs text-iwb-navy">{reference}</span>
            </div>
            {status === "pending" && scheduledDate ? (
              <div className="flex justify-between text-sm">
                <span className="text-iwb-slate-light">Scheduled</span>
                <span className="text-sm text-iwb-navy">
                  {new Date(scheduledDate).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                  })}
                </span>
              </div>
            ) : null}
            {status === "pending" ? (
              <div className="flex justify-between text-sm">
                <span className="text-iwb-slate-light">Status</span>
                <span className="rounded-iwb-full bg-iwb-navy/5 px-2.5 py-0.5 text-xs font-medium text-iwb-slate">Pending</span>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="pt-5 text-center border-t border-dashed border-iwb-border-light mt-5">
            <p className="text-xs text-iwb-slate-light">Electronically generated receipt</p>
            <p className="text-xs text-iwb-slate-light mt-0.5">Thank you for banking with IWB</p>
          </div>
        </div>

        {/* Actions (outside receipt capture area) */}
        {status === "success" || status === "pending" ? (
          <div className="flex gap-3 border-t border-iwb-border-light p-4 bg-iwb-surface">
            <button
              onClick={downloadPNG}
              disabled={capturing !== null}
              className="flex flex-1 items-center justify-center gap-2 rounded-iwb-md border border-iwb-border px-4 py-2.5 text-sm font-medium text-iwb-navy transition-all hover:bg-white disabled:opacity-50"
            >
              {capturing === "png" ? (
                <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
              ) : (
                <i className="material-icons text-base">image</i>
              )}
              {capturing === "png" ? "..." : "PNG"}
            </button>
            <button
              onClick={downloadPDF}
              disabled={capturing !== null}
              className="flex flex-1 items-center justify-center gap-2 rounded-iwb-md border border-iwb-border px-4 py-2.5 text-sm font-medium text-iwb-navy transition-all hover:bg-white disabled:opacity-50"
            >
              {capturing === "pdf" ? (
                <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
              ) : (
                <i className="material-icons text-base">picture_as_pdf</i>
              )}
              {capturing === "pdf" ? "..." : "PDF"}
            </button>
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {status === "failure" ? (
          <button
            onClick={onRetry}
            className="flex-1 rounded-iwb-md bg-iwb-teal px-6 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark text-center"
          >
            Try Again
          </button>
        ) : null}
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex-1 rounded-iwb-md border-2 border-iwb-border px-6 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface text-center"
        >
          Back to Dashboard
        </Link>
      </div>

      {status === "failure" && error ? (
        <div className="rounded-iwb-lg bg-iwb-error/5 border border-iwb-error/20 p-4">
          <div className="flex items-start gap-3">
            <i className="material-icons text-iwb-error text-base mt-0.5">info</i>
            <p className="text-sm text-iwb-error">{error}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/send/send-result.tsx
git commit -m "feat: add SendResult component with success/failure/pending screens and receipt download"
```

---

### Task 9: Create SendForm — Main Client Component + Wire All

**Files:**
- Modify: `src/app/(dashboard)/send/send-form.tsx`
- Delete: `src/components/features/send-money-form.tsx`

- [ ] **Step 1: Rewrite SendForm**

```tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { RecipientSearch } from "@/components/features/recipient-search";
import { sendMoney } from "@/lib/actions/transfer";
import { TransferDetails } from "./transfer-details";
import { ScheduleToggle } from "./schedule-toggle";
import { SendConfirmation } from "./send-confirmation";
import { SendResult } from "./send-result";

type Step = "form" | "confirmation" | "result";
type ResultState = {
  status: "success" | "failure" | "pending";
  error?: string;
} | null;

interface SubAccountOption {
  id: string;
  type: string;
  balance: number;
  is_default: boolean;
}

interface SendFormProps {
  subAccounts: SubAccountOption[];
  accountNumber: string;
  recentRecipients: { account_number: string; full_name: string }[];
  preferredCurrency: string;
}

export function SendForm({ subAccounts, accountNumber, recentRecipients, preferredCurrency }: SendFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const defaultAccount = subAccounts.find((sa) => sa.is_default) ?? subAccounts[0];

  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState>(null);
  const [lastReference, setLastReference] = useState("");

  const [recipient, setRecipient] = useState<{ accountNumber: string; fullName: string } | null>(null);
  const [fromAccount, setFromAccount] = useState(defaultAccount?.id ?? "");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const selectedSub = subAccounts.find((sa) => sa.id === fromAccount);
  const numAmount = parseFloat(amount) || 0;
  const exceedsBalance = selectedSub ? numAmount > selectedSub.balance : false;
  const canSubmit = recipient?.accountNumber && numAmount > 0 && !exceedsBalance;

  const handleConfirm = useCallback(async () => {
    if (!recipient || !canSubmit) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.set("recipient", recipient.accountNumber);
    formData.set("from_sub_account", fromAccount);
    formData.set("amount", amount);
    formData.set("description", reference || "");
    if (scheduleEnabled && scheduleDate) {
      formData.set("scheduled_date", scheduleDate);
    }

    const res = await sendMoney(formData);

    if (res.success) {
      showToast("Money sent successfully", "success");
      setLastReference(res.reference ?? "");
      setResult({
        status: (res.status as "success" | "pending") ?? "success",
      });
      setStep("result");
      router.refresh();
    } else {
      setResult({ status: "failure", error: res.error });
      setStep("result");
    }

    setSubmitting(false);
  }, [recipient, canSubmit, fromAccount, amount, reference, scheduleEnabled, scheduleDate, showToast, router]);

  if (step === "result" && result) {
    return (
      <SendResult
        status={result.status}
        amount={amount}
        recipientName={recipient?.fullName ?? ""}
        reference={lastReference}
        error={result.error ?? undefined}
        scheduledDate={scheduleEnabled ? scheduleDate : undefined}
        preferredCurrency={preferredCurrency}
        onRetry={() => setStep("form")}
        onClose={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Send Money</h1>
        <p className="mt-1 text-sm text-iwb-slate">
          Move funds securely across your global accounts and contacts.
        </p>
      </div>

      {/* Select Recipient */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="material-icons text-iwb-teal">person</i>
          <h2 className="text-sm font-semibold text-iwb-navy">Select Recipient</h2>
        </div>
        <RecipientSearch
          recentRecipients={recentRecipients}
          onSelect={setRecipient}
          selected={recipient}
        />
      </Card>

      {/* Transfer Details */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="material-icons text-iwb-teal">swap_horiz</i>
          <h2 className="text-sm font-semibold text-iwb-navy">Transfer Details</h2>
        </div>
        <TransferDetails
          subAccounts={subAccounts}
          fromAccount={fromAccount}
          onFromAccountChange={setFromAccount}
          amount={amount}
          onAmountChange={setAmount}
          reference={reference}
          onReferenceChange={setReference}
          exceedsBalance={exceedsBalance}
          preferredCurrency={preferredCurrency}
        />
      </Card>

      {/* Schedule */}
      <Card className="p-4">
        <ScheduleToggle
          enabled={scheduleEnabled}
          onToggle={setScheduleEnabled}
          date={scheduleDate}
          onDateChange={setScheduleDate}
        />
      </Card>

      {/* Send Button + Footer */}
      <div className="text-center">
        <button
          onClick={() => setStep("confirmation")}
          disabled={!canSubmit}
          className="w-full rounded-iwb-md bg-iwb-teal px-6 py-3.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send Money
        </button>
        <p className="mt-3 flex items-center justify-center gap-1 text-xs text-iwb-slate-light">
          <i className="material-icons text-xs">verified_user</i>
          Encrypted 256-bit secure transfer
        </p>
      </div>

      {/* Confirmation Modal */}
      {step === "confirmation" ? (
        <SendConfirmation
          recipientName={recipient?.fullName ?? ""}
          recipientAccount={recipient?.accountNumber ?? ""}
          fromAccountName={selectedSub?.type ? (selectedSub.type.charAt(0).toUpperCase() + selectedSub.type.slice(1)) : ""}
          amount={amount}
          reference={reference}
          preferredCurrency={preferredCurrency}
          onConfirm={handleConfirm}
          onCancel={() => setStep("form")}
          loading={submitting}
        />
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Delete old send-money-form.tsx**

```bash
git rm src/components/features/send-money-form.tsx
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 4: Build check**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/send/send-form.tsx
git add -A
git commit -m "feat: rewrite send flow with confirmation step, schedule toggle, and result screen"
```
