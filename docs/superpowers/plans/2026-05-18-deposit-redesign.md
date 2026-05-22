# Deposit Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the deposit page up to the same quality as the redesigned send money page — preferred currency, quick-amount buttons, styled IWB design, success result screen.

**Architecture:** Server component (page) fetches preferredCurrency from cookies, converts balances, passes to client DepositForm. DepositForm uses a 2-step state machine (form → result), inline styled elements with IWB design tokens, and the existing `depositFunds` server action (enhanced to return a reference).

**Tech Stack:** Next.js 16 App Router, Supabase, Tailwind CSS v4, Material Icons, Intl.NumberFormat

---

### Task 1: Enhance Deposit Server Action — Return Reference

**Files:**
- Modify: `src/lib/actions/deposit.ts`

- [ ] **Step 1: Add reference generation and return value**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function generateReference(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 8; i++) random += chars.charAt(Math.floor(Math.random() * chars.length));
  return `DEP${Date.now()}${random}`;
}

export async function depositFunds(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const subAccountId = formData.get("sub_account_id") as string;
  const amountStr = formData.get("amount") as string;
  const description = (formData.get("description") as string) ?? "";

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return { error: "Invalid amount" };

  // Verify user owns this sub-account
  const { data: account } = await supabase
    .from("accounts")
    .select("id, sub_accounts(id)")
    .eq("user_id", user.id)
    .single();

  if (!account) return { error: "Account not found" };

  const subIds = (account.sub_accounts as { id: string }[]).map((s) => s.id);
  if (!subIds.includes(subAccountId)) return { error: "Sub-account not found" };

  const serviceSupabase = createServiceClient();
  const { data: result, error: rpcError } = await serviceSupabase.rpc(
    "admin_credit_account",
    {
      p_sub_account_id: subAccountId,
      p_amount: amount,
      p_description: description || "Self deposit",
    },
  );

  if (rpcError) return { error: `Deposit failed: ${rpcError.message}` };

  const parsed = result as { success: boolean; error?: string };
  if (!parsed.success) return { error: parsed.error ?? "Deposit failed" };

  revalidatePath("/accounts", "layout");
  revalidatePath("/dashboard", "layout");

  const reference = generateReference();
  return { success: true, reference, status: "completed" };
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/deposit.ts
git commit -m "feat: add reference to depositFunds return"
```

---

### Task 2: Update Server Page — Add Preferred Currency + Balance Conversion

**Files:**
- Modify: `src/app/(dashboard)/deposit/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { convertAmount } from "@/lib/currency";
import { DepositForm } from "@/components/features/deposit-form";

export default async function DepositPage() {
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

  const subAccounts = (account?.sub_accounts ?? []) as {
    id: string;
    type: string;
    balance: number;
    currency: string;
    is_default: boolean;
  }[];

  const convertedSubAccounts = await Promise.all(
    subAccounts.map(async (sa) => ({
      id: sa.id,
      type: sa.type,
      balance: await convertAmount(Number(sa.balance), sa.currency, preferredCurrency),
      currency: sa.currency,
      is_default: sa.is_default,
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Deposit</h1>
        <p className="mt-1 text-sm text-iwb-slate">Add funds to your account</p>
      </div>
      <DepositForm subAccounts={convertedSubAccounts} preferredCurrency={preferredCurrency} />
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/deposit/page.tsx
git commit -m "feat: add preferred currency and balance conversion to deposit page"
```

---

### Task 3: Rewrite DepositForm — IWB Design, Quick Amounts, Result Screen

**Files:**
- Modify: `src/components/features/deposit-form.tsx`

- [ ] **Step 1: Rewrite component**

```tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { depositFunds } from "@/lib/actions/deposit";
import { useToast } from "@/components/ui/toast";

interface SubAccount {
  id: string;
  type: string;
  balance: number;
  currency: string;
  is_default: boolean;
}

interface DepositFormProps {
  subAccounts: SubAccount[];
  preferredCurrency: string;
}

const QUICK_AMOUNTS = [100, 500, 1000];

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

type Step = "form" | "result";
type ResultState = {
  status: "success" | "failure";
  reference?: string;
  error?: string;
} | null;

export function DepositForm({ subAccounts, preferredCurrency }: DepositFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const symbol = currencySymbols[preferredCurrency] ?? "$";

  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState>(null);

  const [selectedSubId, setSelectedSubId] = useState(
    subAccounts.find((sa) => sa.is_default)?.id ?? subAccounts[0]?.id ?? "",
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const selectedSub = subAccounts.find((sa) => sa.id === selectedSubId);
  const amountNum = parseFloat(amount);
  const canSubmit = !isNaN(amountNum) && amountNum > 0;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.set("sub_account_id", selectedSubId);
    formData.set("amount", amount);
    formData.set("description", description);

    const res = await depositFunds(formData);

    if (res.success) {
      showToast("Deposit successful", "success");
      setResult({ status: "success", reference: res.reference });
      setStep("result");
      router.refresh();
    } else {
      setResult({ status: "failure", error: res.error });
      setStep("result");
    }

    setSubmitting(false);
  }, [canSubmit, selectedSubId, amount, description, showToast, router]);

  function addQuickAmount(val: number) {
    setAmount(String((parseFloat(amount) || 0) + val));
  }

  if (step === "result" && result) {
    return (
      <div className="space-y-6 max-w-lg">
        <div className={`rounded-iwb-xl border-2 ${result.status === "success" ? "border-iwb-teal" : "border-iwb-error"} bg-white p-8 text-center`}>
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-iwb-navy">
            <i className="material-icons text-white text-2xl">account_balance</i>
          </div>

          <i className={`material-icons text-5xl mb-3 ${result.status === "success" ? "text-iwb-teal" : "text-iwb-error"}`}>
            {result.status === "success" ? "check_circle" : "cancel"}
          </i>
          <h2 className={`text-lg font-semibold mb-1 ${result.status === "success" ? "text-iwb-teal-dark" : "text-iwb-error"}`}>
            {result.status === "success" ? "Deposit Successful" : "Deposit Failed"}
          </h2>

          <p className="text-3xl font-bold text-iwb-navy mt-4">
            {symbol}{amountNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>

          {result.reference ? (
            <p className="mt-4 text-xs text-iwb-slate-light">
              Reference: <span className="font-mono text-iwb-navy">{result.reference}</span>
            </p>
          ) : null}

          <div className="mt-6 flex gap-3">
            {result.status === "failure" ? (
              <button
                onClick={() => setStep("form")}
                className="flex-1 rounded-iwb-md bg-iwb-teal px-4 py-2.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark"
              >
                Try Again
              </button>
            ) : null}
            <Link
              href="/accounts"
              className="flex-1 rounded-iwb-md border-2 border-iwb-border px-4 py-2.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface text-center"
            >
              View in Accounts
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 rounded-iwb-md border-2 border-iwb-border px-4 py-2.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface text-center"
            >
              Dashboard
            </Link>
          </div>

          {result.status === "failure" && result.error ? (
            <div className="mt-4 rounded-iwb-lg bg-iwb-error/5 border border-iwb-error/20 p-4">
              <p className="text-sm text-iwb-error">{result.error}</p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="material-icons text-iwb-teal">account_balance</i>
          <h2 className="text-sm font-semibold text-iwb-navy">Deposit Details</h2>
        </div>

        <div className="space-y-5">
          {/* From Account */}
          <div>
            <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Deposit To</label>
            <div className="mt-2 relative">
              <select
                value={selectedSubId}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="w-full appearance-none rounded-iwb-lg border border-iwb-border bg-white px-4 py-3.5 pr-10 text-sm text-iwb-navy transition-colors hover:border-iwb-teal focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              >
                {subAccounts.map((sa) => (
                  <option key={sa.id} value={sa.id}>
                    {sa.type.charAt(0).toUpperCase() + sa.type.slice(1)} — {symbol}{sa.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
              <i className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-iwb-slate-light pointer-events-none">expand_more</i>
            </div>
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
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="w-full rounded-iwb-lg border border-iwb-border bg-white py-3.5 pl-10 pr-4 text-lg font-semibold text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              />
            </div>
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

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Birthday money, Freelance payment"
              maxLength={200}
              className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full rounded-iwb-md bg-iwb-teal px-6 py-3.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
        ) : null}
        {submitting ? "Processing..." : `Deposit ${symbol}${amountNum > 0 ? amountNum.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}`}
      </button>

      <p className="flex items-center justify-center gap-1 text-xs text-iwb-slate-light">
        <i className="material-icons text-xs">verified_user</i>
        Funds are credited instantly to your account
      </p>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/features/deposit-form.tsx
git commit -m "feat: redesign deposit form with quick amounts, preferred currency, and result screen"
```
