import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { convertAmount } from "@/lib/currency";
import { AccountsClient } from "./accounts-client";

export default async function AccountsPage() {
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

  if (!account) redirect("/dashboard");

  const rawSubAccounts = account.sub_accounts as {
    id: string;
    type: string;
    balance: number;
    currency: string;
    is_default: boolean;
    created_at: string;
  }[];

  const subAccounts = await Promise.all(
    rawSubAccounts.map(async (sa) => ({
      ...sa,
      balance: await convertAmount(Number(sa.balance), "USD", preferredCurrency),
    })),
  );
  const totalBalance = subAccounts.reduce((s, sa) => s + Number(sa.balance), 0);

  return (
    <AccountsClient
      accountNumber={account.account_number}
      totalBalance={totalBalance}
      subAccounts={subAccounts}
    />
  );
}
