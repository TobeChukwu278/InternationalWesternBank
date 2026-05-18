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
