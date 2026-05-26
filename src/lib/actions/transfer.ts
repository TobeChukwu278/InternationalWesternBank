"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdminSession } from "@/lib/admin-auth";
import { createNotificationSystem } from "@/lib/actions/notifications";
import { generateTransferReceipt } from "@/lib/receipt";

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

  const recipientAccountNumber = formData.get("recipient_account_number") as string;
  const recipientName = formData.get("recipient_name") as string;
  const recipientBank = formData.get("recipient_bank") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const fromSubAccount = formData.get("from_sub_account") as string;
  const description = (formData.get("description") as string) || null;
  const scheduledDate = (formData.get("scheduled_date") as string) || null;

  if (!recipientAccountNumber || !recipientName || !recipientBank || !amount || !fromSubAccount) {
    return { error: "Missing required fields" };
  }
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
    .select("id")
    .eq("account_number", recipientAccountNumber)
    .maybeSingle();

  const reference = generateReference();
  const formattedAmount = `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  if (recipientAccount) {
    const { data: recipientSub } = await svc
      .from("sub_accounts")
      .select("id")
      .eq("account_id", recipientAccount.id)
      .eq("is_default", true)
      .single();

    if (!recipientSub) return { error: "Recipient has no active account" };

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
      `Your transfer of ${formattedAmount} to ${recipientName} is pending admin approval. Reference: ${reference}`,
      "transfer",
      reference,
    );

    revalidatePath("/dashboard", "layout");
    revalidatePath("/transactions", "layout");

    return { success: true, transaction_id: tx.id, reference, status: "pending" };
  }

  const { data: tx, error } = await supabase
    .from("transactions")
    .insert({
      from_sub_account_id: fromSubAccount,
      to_sub_account_id: null,
      amount,
      status: "pending",
      type: "transfer",
      reference,
      description,
      scheduled_date: scheduledDate || null,
      recipient_account_number: recipientAccountNumber,
      recipient_name: recipientName,
      recipient_bank: recipientBank,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await createNotificationSystem(
    user.id,
    "Transfer Pending Approval",
    `Your external transfer of ${formattedAmount} to ${recipientName} (${recipientBank}) is pending admin approval. Reference: ${reference}`,
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
    .select("*, sub_accounts!from_sub_account_id(accounts!inner(user_id, account_number))")
    .eq("id", transactionId)
    .eq("status", "pending")
    .single();

  if (!tx) return { error: "Pending transaction not found" };

  const senderUserId = (tx as any).sub_accounts?.accounts?.user_id;
  const fromSubId = tx.from_sub_account_id;
  const reference = tx.reference;
  const description = tx.description;
  const amount = Number(tx.amount);
  const formattedAmount = `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const { data: senderProfile } = await svc
    .from("profiles")
    .select("full_name")
    .eq("id", senderUserId)
    .single();

  const senderName = (senderProfile as any)?.full_name ?? "Sender";

  const recipientAccountNumber = tx.recipient_account_number as string | null;
  const recipientName = tx.recipient_name as string | null;
  const recipientBank = tx.recipient_bank as string | null;

  const isExternal = !!recipientAccountNumber;

  if (isExternal) {
    const { data: result, error: rpcError } = await svc.rpc("admin_debit_account", {
      p_sub_account_id: fromSubId,
      p_amount: amount,
      p_reference: reference,
      p_description: description || null,
    });

    if (rpcError) return { error: `Transfer failed: ${rpcError.message}` };

    const parsed = result as { success: boolean; error?: string };
    if (!parsed.success) return { error: parsed.error ?? "Transfer failed" };

    await svc.from("transactions").update({ status: "completed" }).eq("id", transactionId);

    const receipt = generateTransferReceipt({
      reference,
      amount: formattedAmount,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      senderName,
      senderAccount: `**** ${(tx as any).sub_accounts?.accounts?.account_number?.slice(-4) ?? "????"}`,
      recipientName: recipientName ?? "External",
      recipientAccount: recipientAccountNumber,
      recipientBank: recipientBank ?? "External Bank",
    });

    await createNotificationSystem(
      senderUserId,
      "Transfer Approved",
      `Your external transfer of ${formattedAmount} to ${recipientName} (${recipientBank}) has been approved and completed. Reference: ${reference}`,
      "transfer",
      reference,
      { filename: `receipt-${reference}.pdf`, content: receipt, contentType: "application/pdf" },
    );

    revalidatePath("/admin", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/transactions", "layout");

    return { success: true };
  }

  const { data: recipientSub } = await svc
    .from("sub_accounts")
    .select("accounts!inner(user_id)")
    .eq("id", tx.to_sub_account_id)
    .single();

  const recipientUserId = (recipientSub as any)?.accounts?.user_id;

  const { data: recipientProfile } = await svc
    .from("profiles")
    .select("full_name")
    .eq("id", recipientUserId)
    .single();

  const internalRecipientName = (recipientProfile as any)?.full_name ?? "Recipient";

  const { data: result, error: rpcError } = await svc.rpc("transfer_money", {
    p_from_sub_account_id: fromSubId,
    p_to_sub_account_id: tx.to_sub_account_id,
    p_amount: amount,
    p_reference: reference,
    p_description: description || null,
  });

  if (rpcError) return { error: `Transfer failed: ${rpcError.message}` };

  const parsed = result as { success: boolean; error?: string; transaction_id?: string };
  if (!parsed.success) return { error: parsed.error ?? "Transfer failed" };

  await svc.from("transactions").update({ status: "completed" }).eq("id", transactionId);

  const receipt = generateTransferReceipt({
    reference,
    amount: formattedAmount,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    senderName,
    senderAccount: "",
    recipientName: internalRecipientName,
    recipientAccount: "",
    recipientBank: "International Western Bank",
  });

  await createNotificationSystem(
    senderUserId,
    "Transfer Approved",
    `Your transfer of ${formattedAmount} to ${internalRecipientName} has been approved and completed. Reference: ${reference}`,
    "transfer",
    reference,
    { filename: `receipt-${reference}.pdf`, content: receipt, contentType: "application/pdf" },
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
    .select("*, sub_accounts!from_sub_account_id(accounts!inner(user_id, account_number))")
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
