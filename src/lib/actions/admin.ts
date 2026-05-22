"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";

export async function creditAccount(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const subAccountId = formData.get("sub_account_id") as string;
  const amountStr = formData.get("amount") as string;
  const description = (formData.get("description") as string) ?? "";

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Invalid amount" };
  }

  const serviceSupabase = createServiceClient();

  const { data: result, error: rpcError } = await serviceSupabase.rpc(
    "admin_credit_account",
    {
      p_sub_account_id: subAccountId,
      p_amount: amount,
      p_description: description || null,
    },
  );

  if (rpcError) {
    return { error: `Credit failed: ${rpcError.message}` };
  }

  const parsed = result as { success: boolean; error?: string; transaction_id?: string };

  if (!parsed.success) {
    return { error: parsed.error ?? "Credit failed" };
  }

  revalidatePath("/admin", "layout");

  return { success: true, transaction_id: parsed.transaction_id };
}

export async function debitAccount(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const subAccountId = formData.get("sub_account_id") as string;
  const amountStr = formData.get("amount") as string;
  const description = (formData.get("description") as string) ?? "";

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Invalid amount" };
  }

  const serviceSupabase = createServiceClient();

  const { data: result, error: rpcError } = await serviceSupabase.rpc(
    "admin_debit_account",
    {
      p_sub_account_id: subAccountId,
      p_amount: amount,
      p_description: description || null,
    },
  );

  if (rpcError) {
    return { error: `Debit failed: ${rpcError.message}` };
  }

  const parsed = result as { success: boolean; error?: string; transaction_id?: string };

  if (!parsed.success) {
    return { error: parsed.error ?? "Debit failed" };
  }

  revalidatePath("/admin", "layout");

  return { success: true, transaction_id: parsed.transaction_id };
}

export async function deleteUser(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const userId = formData.get("user_id") as string;
  const userEmail = formData.get("user_email") as string;

  if (!userId) return { error: "User ID is required" };

  const serviceSupabase = createServiceClient();

  const { error: updateError } = await serviceSupabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", userId);

  if (updateError) {
    return { error: `Failed to delete user: ${updateError.message}` };
  }

  const { error: notifError } = await serviceSupabase
    .from("notifications")
    .insert({
      user_id: userId,
      title: "Account Deleted",
      message: "Your account has been deleted by an administrator.",
      type: "system",
    });

  if (notifError) {
    console.error("Failed to create notification:", notifError.message);
  }

  revalidatePath("/admin", "layout");

  return { success: true };
}
