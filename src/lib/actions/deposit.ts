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
