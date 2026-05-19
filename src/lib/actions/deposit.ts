"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdminSession } from "@/lib/admin-auth";
import { createNotificationSystem } from "@/lib/actions/notifications";

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

  const { data: account } = await supabase
    .from("accounts")
    .select("id, sub_accounts(id)")
    .eq("user_id", user.id)
    .single();

  if (!account) return { error: "Account not found" };

  const subIds = (account.sub_accounts as { id: string }[]).map((s) => s.id);
  if (!subIds.includes(subAccountId)) return { error: "Sub-account not found" };

  const reference = generateReference();
  const externalBank = formData.get("external_bank") as string || "External Bank";

  const svc = createServiceClient();
  const { error: insertError } = await svc.from("transactions").insert({
    to_sub_account_id: subAccountId,
    amount,
    status: "pending",
    type: "deposit",
    reference,
    description: `Bank transfer from ${externalBank} — ${description || "Self deposit"}`,
  });

  if (insertError) return { error: `Deposit failed: ${insertError.message}` };

  await createNotificationSystem(
    user.id,
    "Deposit Pending",
    `Your deposit of $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} from ${externalBank} is pending confirmation. Reference: ${reference}`,
    "deposit",
    reference,
  );

  revalidatePath("/accounts", "layout");
  revalidatePath("/dashboard", "layout");

  return { success: true, reference, status: "pending" };
}

export async function confirmDeposit(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const transactionId = formData.get("transaction_id") as string;
  if (!transactionId) return { error: "Missing transaction ID" };

  const svc = createServiceClient();

  const { data: tx } = await svc
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .eq("status", "pending")
    .single();

  if (!tx) return { error: "Pending transaction not found" };

  const subAccountId = tx.to_sub_account_id;
  if (!subAccountId) return { error: "Transaction has no target sub-account" };

  const { data: subAccount } = await svc
    .from("sub_accounts")
    .select("accounts!inner(user_id)")
    .eq("id", subAccountId)
    .single();

  if (!subAccount) return { error: "Sub-account not found" };

  const userId = (subAccount as any).accounts.user_id;

  const { data: result, error: rpcError } = await svc.rpc("admin_credit_account", {
    p_sub_account_id: subAccountId,
    p_amount: Number(tx.amount),
    p_description: tx.description || "Deposit confirmed",
  });

  if (rpcError) return { error: `Credit failed: ${rpcError.message}` };

  const parsed = result as { success: boolean; error?: string };
  if (!parsed.success) return { error: parsed.error ?? "Credit failed" };

  await svc.from("transactions").update({ status: "completed" }).eq("id", transactionId);

  await createNotificationSystem(
    userId,
    "Deposit Confirmed",
    `Your deposit of $${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} has been confirmed and credited to your account.`,
    "deposit",
    tx.reference,
  );

  revalidatePath("/admin", "layout");
  revalidatePath("/accounts", "layout");
  revalidatePath("/dashboard", "layout");

  return { success: true };
}

export async function rejectDeposit(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const transactionId = formData.get("transaction_id") as string;
  if (!transactionId) return { error: "Missing transaction ID" };

  const svc = createServiceClient();

  const { data: tx } = await svc
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .eq("status", "pending")
    .single();

  if (!tx) return { error: "Pending transaction not found" };

  const subAccountId = tx.to_sub_account_id;
  if (!subAccountId) return { error: "Transaction has no target sub-account" };

  const { data: subAccount } = await svc
    .from("sub_accounts")
    .select("accounts!inner(user_id)")
    .eq("id", subAccountId)
    .single();

  const userId = subAccount ? (subAccount as any).accounts.user_id : null;

  await svc.from("transactions").update({ status: "failed" }).eq("id", transactionId);

  if (userId) {
    await createNotificationSystem(
      userId,
      "Deposit Rejected",
      `Your deposit of $${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} has been rejected. Please contact support for details.`,
      "deposit",
      tx.reference,
    );
  }

  revalidatePath("/admin", "layout");

  return { success: true };
}
