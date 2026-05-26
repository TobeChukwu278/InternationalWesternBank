import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { convertAmount } from "@/lib/currency";
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

  const convertedSubAccounts = await Promise.all(
    subAccounts.map(async (sa) => ({
      id: sa.id,
      type: sa.type,
      balance: await convertAmount(Number(sa.balance), sa.currency, preferredCurrency),
      is_default: sa.is_default,
    })),
  );

  return (
    <SendForm
      subAccounts={convertedSubAccounts}
      accountNumber={account.account_number}
      preferredCurrency={preferredCurrency}
    />
  );
}
