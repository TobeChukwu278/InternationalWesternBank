"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function sendMoney(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const recipientAccountNumber = formData.get("recipient") as string;
  const amountStr = formData.get("amount") as string;
  const description = (formData.get("description") as string) ?? "";
  const fromSubAccountId = formData.get("from_sub_account") as string;

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Invalid amount" };
  }

  // Verify sender actually owns this sub_account (using auth'd client)
  const { data: senderSub } = await supabase
    .from("sub_accounts")
    .select("id, balance")
    .eq("id", fromSubAccountId)
    .single();

  if (!senderSub) {
    return { error: "Sender account not found" };
  }

  if (Number(senderSub.balance) < amount) {
    return { error: "Insufficient balance" };
  }

  // Use service client to find recipient (bypasses RLS)
  const serviceSupabase = createServiceClient();

  const { data: recipientAccount } = await serviceSupabase
    .from("accounts")
    .select("id")
    .eq("account_number", recipientAccountNumber)
    .single();

  if (!recipientAccount) {
    return { error: "Recipient account not found" };
  }

  const { data: recipientSubAccount } = await serviceSupabase
    .from("sub_accounts")
    .select("id")
    .eq("account_id", recipientAccount.id)
    .eq("is_default", true)
    .single();

  if (!recipientSubAccount) {
    return { error: "Recipient has no active account" };
  }

  const reference = `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  // Execute transfer via DB function (SECURITY DEFINER, bypasses RLS internally)
  const { data: result, error: rpcError } = await supabase.rpc("transfer_money", {
    p_from_sub_account_id: fromSubAccountId,
    p_to_sub_account_id: recipientSubAccount.id,
    p_amount: amount,
    p_reference: reference,
    p_description: description || null,
  });

  if (rpcError) {
    return { error: `Transfer failed: ${rpcError.message}` };
  }

  const parsed = result as { success: boolean; error?: string; transaction_id?: string };

  if (!parsed.success) {
    return { error: parsed.error ?? "Transfer failed" };
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/transactions", "layout");

  return { success: true, transaction_id: parsed.transaction_id };
}
