import { createClient } from "./server";
import type { Profile, Account, SubAccount, Transaction } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data as Profile | null;
}

export async function getAccounts(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("accounts")
    .select("*, sub_accounts(*)")
    .eq("user_id", userId)
    .single();
  return data as (Account & { sub_accounts: SubAccount[] }) | null;
}

export async function getSubAccounts(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sub_accounts")
    .select("*, accounts!inner(user_id)")
    .eq("accounts.user_id", userId);
  return data as SubAccount[] | null;
}

export async function getTransactions(accountId: string) {
  const supabase = await createClient();
  const { data: subAccounts } = await supabase
    .from("sub_accounts")
    .select("id")
    .eq("account_id", accountId);

  if (!subAccounts?.length) return [];

  const subAccountIds = subAccounts.map((s) => s.id);

  const { data } = await supabase
    .from("transactions")
    .select("*, from_sub_account:from_sub_account_id(*), to_sub_account:to_sub_account_id(*)")
    .or(`from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`)
    .order("created_at", { ascending: false });

  return data as Transaction[] | null;
}
