import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { convertAmount } from "@/lib/currency";
import { DepositForm } from "@/components/features/deposit-form";

export default async function DepositPage() {
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

  const subAccounts = (account?.sub_accounts ?? []) as {
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
      currency: sa.currency,
      is_default: sa.is_default,
    })),
  );

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Deposit</h1>
        <p className="mt-1 text-sm text-iwb-slate">Add funds to your account</p>
      </div>
      <DepositForm subAccounts={convertedSubAccounts} preferredCurrency={preferredCurrency} />
    </div>
  );
}
