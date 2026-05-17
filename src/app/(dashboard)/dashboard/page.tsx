import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BalanceCard } from "@/components/features/balance-card";
import { QuickActions } from "@/components/features/quick-actions";
import { RecentTransactions } from "@/components/features/recent-transactions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(*)")
    .eq("user_id", user.id)
    .single();

  const subAccounts = account?.sub_accounts ?? [];
  const totalBalance = subAccounts.reduce(
    (sum: number, sa: { balance: number }) => sum + Number(sa.balance),
    0,
  );

  const subAccountIds = subAccounts.map((sa: { id: string }) => sa.id);
  const { data: recentTxs } = await supabase
    .from("transactions")
    .select("*")
    .or(
      `from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">
          Welcome, {profile?.full_name ?? "User"}
        </h1>
        <p className="mt-1 text-sm text-iwb-slate">
          Here&apos;s your financial overview
        </p>
      </div>

      <BalanceCard
        totalBalance={totalBalance}
        accountNumber={account?.account_number ?? "N/A"}
        trendPercent={null}
      />

      <QuickActions />

      <RecentTransactions transactions={recentTxs ?? []} subAccountIds={subAccountIds} />
    </div>
  );
}
