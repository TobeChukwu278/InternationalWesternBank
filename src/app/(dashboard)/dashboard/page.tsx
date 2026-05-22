import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BalanceCard } from "@/components/features/balance-card";
import { QuickActions } from "@/components/features/quick-actions";
import { AccountCards } from "@/components/features/account-cards";
import { SpendingInsights } from "@/components/features/spending-insights";
import { RecentTransactions } from "@/components/features/recent-transactions";
import { PromotionCard } from "@/components/features/promotion-card";
import { convertAmount } from "@/lib/currency";
import { NotificationBell } from "@/components/features/notification-bell";
import { getUnreadNotifications } from "@/lib/actions/notifications";
import { t } from "@/i18n/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const preferredCurrency = cookieStore.get("preferred_currency")?.value ?? "USD";

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

  if (!account) redirect("/login");

  const { notifications, unreadCount } = await getUnreadNotifications(5);

  const subAccounts = account.sub_accounts ?? [];
  const rawTotalBalance = subAccounts.reduce(
    (sum: number, sa: { balance: number }) => sum + Number(sa.balance),
    0,
  );
  const totalBalance = await convertAmount(rawTotalBalance, "USD", preferredCurrency);

  const subAccountIds = subAccounts.map((sa: { id: string }) => sa.id);

  // Recent transactions
  const { data: recentTxs } = await supabase
    .from("transactions")
    .select("*")
    .or(
      `from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  // Monthly spending aggregation (outgoing only)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const { data: thisMonthTxs } = await supabase
    .from("transactions")
    .select("category, amount, from_sub_account_id, to_sub_account_id")
    .or(
      `from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`,
    )
    .gte("created_at", startOfMonth.toISOString())
    .lt("created_at", startOfNextMonth.toISOString());

  // Calculate trend
  let incomingThisMonth = 0;
  let outgoingThisMonth = 0;
  const categoryTotals: Record<string, number> = {};

  for (const tx of thisMonthTxs ?? []) {
    const isOutgoing = tx.from_sub_account_id && subAccountIds.includes(tx.from_sub_account_id);
    const isIncomingTx = tx.to_sub_account_id && subAccountIds.includes(tx.to_sub_account_id);

    if (isOutgoing && !isIncomingTx) {
      outgoingThisMonth += Number(tx.amount);
      const cat = tx.category ?? "other";
      categoryTotals[cat] = (categoryTotals[cat] ?? 0) + Number(tx.amount);
    } else if (isIncomingTx && !isOutgoing) {
      incomingThisMonth += Number(tx.amount);
    }
  }

  const netChange = incomingThisMonth - outgoingThisMonth;
  const startBalance = totalBalance - netChange;
  const trendPercent = startBalance > 0 ? (netChange / startBalance) * 100 : null;

  const totalSpending = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
  const spendingByCategory = Object.entries(categoryTotals)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-iwb-navy">
            {await t("dashboard.welcome", { name: profile?.full_name ?? "User" })}
          </h1>
          <p className="mt-1 text-sm text-iwb-slate">
            {await t("dashboard.wealthOverview")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell initialUnreadCount={unreadCount} initialNotifications={notifications} />
          <a
            href="/settings"
            className="flex size-10 items-center justify-center rounded-full bg-white text-iwb-slate-light shadow-iwb-card transition-colors hover:bg-iwb-surface hover:text-iwb-navy"
            title={await t("nav.settings")}
          >
            <i className="material-icons">settings</i>
          </a>
        </div>
      </div>

      <BalanceCard
        totalBalance={totalBalance}
        accountNumber={account.account_number}
        trendPercent={trendPercent}
      />

      <QuickActions />

      <AccountCards
        subAccounts={await Promise.all(
          subAccounts.map(async (sa: { id: string; type: string; balance: number }) => ({
            id: sa.id,
            type: sa.type,
            balance: await convertAmount(Number(sa.balance), "USD", preferredCurrency),
            accountNumber: account.account_number,
          })),
        )}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingInsights spendingByCategory={spendingByCategory} />
        <RecentTransactions
          transactions={recentTxs ?? []}
          subAccountIds={subAccountIds}
        />
      </div>

      <PromotionCard />
    </div>
  );
}
