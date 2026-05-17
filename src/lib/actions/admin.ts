"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("id", user.id)
    .single();

  return !!admin;
}

export async function creditAccount(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!admin) return { error: "Not authorized" };

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
  revalidatePath("/admin/users", "layout");

  return { success: true, transaction_id: parsed.transaction_id };
}

export async function debitAccount(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!admin) return { error: "Not authorized" };

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
  revalidatePath("/admin/users", "layout");

  return { success: true, transaction_id: parsed.transaction_id };
}
