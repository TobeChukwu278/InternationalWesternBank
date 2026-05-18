import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SendForm } from "./send-form";

export default async function SendPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const preferredCurrency = cookieStore.get("preferred_currency")?.value ?? "USD";

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(*)")
    .eq("user_id", user.id)
    .single();

  if (!account) redirect("/login");

  const subAccounts = account.sub_accounts as {
    id: string;
    type: string;
    balance: number;
    currency: string;
    is_default: boolean;
  }[];

  const subAccountIds = subAccounts.map((sa) => sa.id);

  // Fetch recent transfer recipients
  const svc = createServiceClient();
  const { data: recentTx } = await svc
    .from("transactions")
    .select("to_sub_account_id")
    .in("from_sub_account_id", subAccountIds)
    .eq("type", "transfer")
    .eq("status", "completed")
    .not("to_sub_account_id", "is", null)
    .order("created_at", { ascending: false });

  const recipientSubIds = [
    ...new Set(
      (recentTx ?? [])
        .map((tx) => tx.to_sub_account_id as string)
        .filter((id) => !subAccountIds.includes(id)),
    ),
  ].slice(0, 10);

  type RecipientInfo = { account_number: string; full_name: string };
  let recentRecipients: RecipientInfo[] = [];

  if (recipientSubIds.length > 0) {
    const { data: subs } = await svc
      .from("sub_accounts")
      .select("accounts!inner(account_number, profiles!inner(full_name))")
      .in("id", recipientSubIds);

    recentRecipients = (subs ?? []).map((s: any) => ({
      account_number: s.accounts.account_number,
      full_name: s.accounts.profiles.full_name,
    }));
  }

  return (
    <SendForm
      subAccounts={subAccounts.map((sa) => ({
        id: sa.id,
        type: sa.type,
        balance: Number(sa.balance),
        is_default: sa.is_default,
      }))}
      accountNumber={account.account_number}
      recentRecipients={recentRecipients}
      preferredCurrency={preferredCurrency}
    />
  );
}
