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
