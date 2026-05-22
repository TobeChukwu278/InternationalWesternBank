# Transfer Admin Approval Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require admin approval for all outgoing transfers before funds move.

**Architecture:** Transfer inserts pending transaction (no RPC), admin approves to execute the `transfer_money` RPC, or rejects with a reason message sent to the sender.

**Tech Stack:** Next.js 16 App Router, Supabase (Postgres + RPC), Tailwind CSS v4

---

### Task 1: Migration — Add `admin_note` to Transactions

**Files:**
- Create: `supabase/migrations/00012_transfers_admin_approval.sql`

- [ ] **Step 1: Create migration**

```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_note TEXT;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/00012_transfers_admin_approval.sql
git commit -m "feat: add admin_note column to transactions"
```

---

### Task 2: Rewrite `sendMoney` + Add Approve/Reject Actions

**Files:**
- Modify: `src/lib/actions/transfer.ts`

- [ ] **Step 1: Rewrite `sendMoney` — always insert pending**

Remove the instant transfer RPC path. All transfers go through pending:

```ts
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

  const { data: account } = await supabase
    .from("accounts")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!account) return { error: "Account not found" };

  const { data: senderSub } = await supabase
    .from("sub_accounts")
    .select("balance")
    .eq("id", fromSubAccount)
    .eq("account_id", account.id)
    .single();

  if (!senderSub) return { error: "Invalid source account" };
  if (senderSub.balance < amount) return { error: "Insufficient funds" };

  const svc = createServiceClient();
  const { data: recipientAccount } = await svc
    .from("accounts")
    .select("id, user_id")
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

  const { data: senderProfile } = await svc
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const formattedAmount = `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

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
      scheduled_date: scheduledDate || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await createNotificationSystem(
    user.id,
    "Transfer Pending Approval",
    `Your transfer of ${formattedAmount} to account ${recipient} is pending admin approval. Reference: ${reference}`,
    "transfer",
    reference,
  );

  revalidatePath("/dashboard", "layout");
  revalidatePath("/transactions", "layout");

  return { success: true, transaction_id: tx.id, reference, status: "pending" };
}
```

- [ ] **Step 2: Add `approveTransfer` server action**

```ts
export async function approveTransfer(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const transactionId = formData.get("transaction_id") as string;
  if (!transactionId) return { error: "Missing transaction ID" };

  const svc = createServiceClient();

  const { data: tx } = await svc
    .from("transactions")
    .select("*, sub_accounts!from_sub_account_id(accounts!inner(user_id))")
    .eq("id", transactionId)
    .eq("status", "pending")
    .single();

  if (!tx) return { error: "Pending transaction not found" };

  const senderUserId = (tx as any).sub_accounts?.accounts?.user_id;
  const fromSubId = tx.from_sub_account_id;
  const toSubId = tx.to_sub_account_id;

  const { data: recipientSub } = await svc
    .from("sub_accounts")
    .select("accounts!inner(user_id)")
    .eq("id", toSubId)
    .single();

  const recipientUserId = (recipientSub as any)?.accounts?.user_id;

  const { data: senderProfile } = await svc
    .from("profiles")
    .select("full_name")
    .eq("id", senderUserId)
    .single();

  const { data: recipientProfile } = await svc
    .from("profiles")
    .select("full_name")
    .eq("id", recipientUserId)
    .single();

  const senderName = (senderProfile as any)?.full_name ?? "Sender";
  const recipientName = (recipientProfile as any)?.full_name ?? "Recipient";
  const formattedAmount = `$${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const reference = tx.reference;

  // Execute the atomic transfer
  const { data: result, error: rpcError } = await svc.rpc("transfer_money", {
    p_from_sub_account_id: fromSubId,
    p_to_sub_account_id: toSubId,
    p_amount: Number(tx.amount),
    p_reference: reference,
    p_description: tx.description || null,
  });

  if (rpcError) return { error: `Transfer failed: ${rpcError.message}` };

  const parsed = result as { success: boolean; error?: string; transaction_id?: string };
  if (!parsed.success) return { error: parsed.error ?? "Transfer failed" };

  // Update the pending transaction as completed
  await svc.from("transactions").update({ status: "completed" }).eq("id", transactionId);

  await createNotificationSystem(
    senderUserId,
    "Transfer Approved",
    `Your transfer of ${formattedAmount} to ${recipientName} has been approved and completed. Reference: ${reference}`,
    "transfer",
    reference,
  );

  if (recipientUserId) {
    await createNotificationSystem(
      recipientUserId,
      "Money Received",
      `You received ${formattedAmount} from ${senderName}. Reference: ${reference}`,
      "transfer",
      reference,
    );
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/transactions", "layout");

  return { success: true };
}
```

- [ ] **Step 3: Add `rejectTransfer` server action**

```ts
export async function rejectTransfer(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const transactionId = formData.get("transaction_id") as string;
  const reason = (formData.get("reason") as string) || "No reason provided";
  if (!transactionId) return { error: "Missing transaction ID" };

  const svc = createServiceClient();

  const { data: tx } = await svc
    .from("transactions")
    .select("*, sub_accounts!from_sub_account_id(accounts!inner(user_id))")
    .eq("id", transactionId)
    .eq("status", "pending")
    .single();

  if (!tx) return { error: "Pending transaction not found" };

  const senderUserId = (tx as any).sub_accounts?.accounts?.user_id;

  const formattedAmount = `$${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  await svc
    .from("transactions")
    .update({ status: "failed", admin_note: reason })
    .eq("id", transactionId);

  if (senderUserId) {
    await createNotificationSystem(
      senderUserId,
      "Transfer Rejected",
      `Your transfer of ${formattedAmount} has been rejected. Reason: ${reason}. Reference: ${tx.reference}`,
      "transfer",
      tx.reference,
    );
  }

  revalidatePath("/admin", "layout");

  return { success: true };
}
```

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/transfer.ts
git commit -m "feat: make all transfers pending until admin approval"
```

---

### Task 3: Admin Transfers Page

**Files:**
- Create: `src/app/admin/transfers/page.tsx`
- Create: `src/app/admin/transfers/transfer-actions.tsx`

- [ ] **Step 1: Create admin transfers page**

```tsx
import { createServiceClient } from "@/lib/supabase/service";
import { TransferActions } from "./transfer-actions";

export default async function AdminTransfersPage() {
  const svc = createServiceClient();

  const { data: pendingTransfers } = await svc
    .from("transactions")
    .select("*, sub_accounts!from_sub_account_id(accounts!inner(profiles!inner(full_name, email))), to:to_sub_account_id(id)")
    .eq("type", "transfer")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const pendingItems = (pendingTransfers ?? []).map((tx: any) => ({
    id: tx.id,
    amount: Number(tx.amount),
    reference: tx.reference,
    description: tx.description ?? "",
    createdAt: tx.created_at,
    scheduledDate: tx.scheduled_date,
    senderName: tx.sub_accounts?.accounts?.profiles?.full_name ?? "Unknown",
    senderEmail: tx.sub_accounts?.accounts?.profiles?.email ?? "Unknown",
  }));

  const { data: completedTransfers } = await svc
    .from("transactions")
    .select("*")
    .eq("type", "transfer")
    .in("status", ["completed", "failed"])
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Transfers</h1>
        <p className="mt-1 text-sm text-iwb-slate">Approve or reject pending transfers</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-iwb-navy mb-4">
          Pending Approvals
          {pendingItems.length > 0 ? (
            <span className="ml-2 rounded-iwb-full bg-iwb-error/10 px-2.5 py-0.5 text-xs font-medium text-iwb-error">
              {pendingItems.length}
            </span>
          ) : null}
        </h2>

        {pendingItems.length === 0 ? (
          <div className="rounded-iwb-xl bg-white p-12 text-center shadow-iwb-card">
            <i className="material-icons text-4xl text-iwb-slate-light mb-3">check_circle</i>
            <p className="text-base font-medium text-iwb-navy">No pending transfers</p>
            <p className="mt-1 text-sm text-iwb-slate">All transfers have been processed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="rounded-iwb-lg bg-white shadow-iwb-card border border-iwb-border-light overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-iwb-navy/5">
                        <i className="material-icons text-iwb-slate">swap_horiz</i>
                      </span>
                      <div>
                        <p className="text-sm font-medium text-iwb-navy">{item.senderName}</p>
                        <p className="text-xs text-iwb-slate-light">{item.senderEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-iwb-error">
                        -${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-iwb-slate-light">Reference:</span>
                      <span className="ml-1 font-mono text-iwb-navy">{item.reference}</span>
                    </div>
                    <div>
                      <span className="text-iwb-slate-light">Date:</span>
                      <span className="ml-1 text-iwb-navy">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {item.scheduledDate ? (
                      <div>
                        <span className="text-iwb-slate-light">Scheduled:</span>
                        <span className="ml-1 text-iwb-navy">
                          {new Date(item.scheduledDate).toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                          })}
                        </span>
                      </div>
                    ) : null}
                    <div className="col-span-2">
                      <span className="text-iwb-slate-light">Memo:</span>
                      <span className="ml-1 text-iwb-navy">{item.description || "—"}</span>
                    </div>
                  </div>
                </div>

                <TransferActions transactionId={item.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-iwb-navy mb-4">Recent History</h2>
        {(completedTransfers ?? []).length === 0 ? (
          <p className="text-sm text-iwb-slate">No completed or rejected transfers yet</p>
        ) : (
          <div className="rounded-iwb-xl bg-white shadow-iwb-card overflow-hidden">
            <div className="divide-y divide-iwb-border-light">
              {(completedTransfers ?? []).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-8 items-center justify-center rounded-full text-xs ${
                        tx.status === "completed"
                          ? "bg-iwb-teal/10 text-iwb-teal"
                          : "bg-iwb-error/10 text-iwb-error"
                      }`}
                    >
                      <i className="material-icons text-sm">
                        {tx.status === "completed" ? "check" : "close"}
                      </i>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-iwb-navy capitalize">{tx.status}</p>
                      <p className="text-xs text-iwb-slate-light font-mono">{tx.reference}</p>
                      {tx.admin_note ? (
                        <p className="text-xs text-iwb-error mt-0.5">{tx.admin_note}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-iwb-navy">
                      ${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-iwb-slate-light">
                      {new Date(tx.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create transfer-actions.tsx**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveTransfer, rejectTransfer } from "@/lib/actions/transfer";

interface TransferActionsProps {
  transactionId: string;
}

export function TransferActions({ transactionId }: TransferActionsProps) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    const formData = new FormData();
    formData.set("transaction_id", transactionId);
    const res = await approveTransfer(formData);
    if (res.success) router.refresh();
    setLoading(false);
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setLoading(true);
    const formData = new FormData();
    formData.set("transaction_id", transactionId);
    formData.set("reason", rejectReason);
    const res = await rejectTransfer(formData);
    if (res.success) router.refresh();
    setLoading(false);
  }

  return (
    <div className="border-t border-iwb-border-light px-5 py-3 bg-iwb-surface">
      {showReject ? (
        <div className="space-y-3">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={2}
            className="w-full rounded-iwb-md border border-iwb-border bg-white px-3 py-2 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-error focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
              className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-error px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-iwb-error/90 disabled:opacity-50"
            >
              {loading ? "..." : "Confirm Reject"}
            </button>
            <button
              onClick={() => { setShowReject(false); setRejectReason(""); }}
              className="rounded-iwb-md border border-iwb-border px-4 py-2 text-xs font-semibold text-iwb-slate"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-iwb-md bg-iwb-teal px-4 py-2 text-xs font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:opacity-50"
          >
            <i className="material-icons text-sm">check</i>
            {loading ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-iwb-md border border-iwb-error/30 px-4 py-2 text-xs font-semibold text-iwb-error transition-all hover:bg-iwb-error/5 disabled:opacity-50"
          >
            <i className="material-icons text-sm">close</i>
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/transfers/
git commit -m "feat: add admin transfers page with approve/reject"
```

---

### Task 4: Update Admin Sidebar + SendResult

**Files:**
- Modify: `src/components/features/admin-sidebar.tsx`
- Modify: `src/app/(dashboard)/send/send-result.tsx`

- [ ] **Step 1: Add "Transfers" nav item between "Deposits" and "KYC"**

Add to `navItems` array:

```ts
  {
    label: "Transfers",
    href: "/admin/transfers",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    ),
  },
```

- [ ] **Step 2: Update SendResult to show "Pending Approval" for non-scheduled**

Change the pending config to show dynamic heading:

```tsx
  const isAdminPending = status === "pending" && !scheduledDate;
```

In the receipt rendering section, change the condition to show appropriate messaging:

```tsx
{status === "pending" && !scheduledDate ? (
  <div className="flex justify-between text-sm">
    <span className="text-iwb-slate-light">Status</span>
    <span className="rounded-iwb-full bg-iwb-navy/5 px-2.5 py-0.5 text-xs font-medium text-iwb-amber">Pending Approval</span>
  </div>
) : null}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty`

- [ ] **Step 4: Build check**

Run: `pnpm build`

- [ ] **Step 5: Commit**

```bash
git add src/components/features/admin-sidebar.tsx src/app/\(dashboard\)/send/send-result.tsx
git commit -m "feat: add transfers admin nav, update send result for pending approval"
```
