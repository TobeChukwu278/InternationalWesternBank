import { createServiceClient } from "@/lib/supabase/service";
import { Card } from "@/components/ui/card";
import { t } from "@/i18n/server";

export default async function AdminReportsPage() {
  const supabase = createServiceClient();

  const [
    { data: allTxs },
    { data: topUsers },
    { data: dailyVolume },
  ] = await Promise.all([
    supabase.from("transactions").select("amount, type, status, created_at"),
    supabase
      .from("profiles")
      .select("full_name, email, accounts!inner(sub_accounts(id, balance))")
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select("amount, type, created_at")
      .eq("status", "completed")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const totalDeposits = (allTxs ?? [])
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawals = (allTxs ?? [])
    .filter((t) => t.type === "withdrawal" && t.status === "completed")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalTransfers = (allTxs ?? [])
    .filter((t) => t.type === "transfer" && t.status === "completed")
    .reduce((s, t) => s + Number(t.amount), 0);
  const completedTxCount = (allTxs ?? []).filter((t) => t.status === "completed").length;

  const userBalances = (topUsers ?? [])
    .map((u) => {
      const acct = (u.accounts as { sub_accounts: { balance: number }[] }[])?.[0];
      const subs = acct?.sub_accounts ?? [];
      const total = subs.reduce((s, sa) => s + Number(sa.balance), 0);
      return { name: u.full_name, email: u.email, balance: total };
    })
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10);

  const dailyMap = new Map<string, { deposits: number; withdrawals: number; transfers: number; count: number }>();
  for (const tx of dailyVolume ?? []) {
    const day = new Date(tx.created_at).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });
    const entry = dailyMap.get(day) ?? { deposits: 0, withdrawals: 0, transfers: 0, count: 0 };
    if (tx.type === "deposit") entry.deposits += Number(tx.amount);
    else if (tx.type === "withdrawal") entry.withdrawals += Number(tx.amount);
    else entry.transfers += Number(tx.amount);
    entry.count++;
    dailyMap.set(day, entry);
  }
  const dailyData = Array.from(dailyMap.entries()).reverse();
  const maxDaily = Math.max(...dailyData.map(([, d]) => d.deposits + d.withdrawals + d.transfers), 1);

  const [
    reportsTitle,
    reportsSubtitle,
    totalDepositsLabel,
    totalWithdrawalsLabel,
    totalTransfersLabel,
    allTimeCompletedLabel,
    completedTransactionsLabel,
    volume30DayLabel,
    noDataLabel,
    legendDeposits,
    legendTransfers,
    legendWithdrawals,
    topUsersLabel,
    noUsersBalancesLabel,
  ] = await Promise.all([
    t("admin.reports.title"),
    t("admin.reports.subtitle"),
    t("admin.reports.totalDeposits"),
    t("admin.reports.totalWithdrawals"),
    t("admin.reports.totalTransfers"),
    t("admin.reports.allTimeCompleted"),
    t("admin.reports.completedTransactions", { count: String(completedTxCount) }),
    t("admin.reports.volume30Day"),
    t("admin.reports.noData30Days"),
    t("admin.reports.legendDeposits"),
    t("admin.reports.legendTransfers"),
    t("admin.reports.legendWithdrawals"),
    t("admin.reports.topUsersByBalance"),
    t("admin.reports.noUsersBalances"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">{reportsTitle}</h1>
        <p className="mt-1 text-sm text-iwb-slate">{reportsSubtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-iwb-slate-light">{totalDepositsLabel}</p>
          <p className="mt-1.5 text-2xl font-bold text-iwb-teal">
            ${totalDeposits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-0.5 text-xs text-iwb-slate">{allTimeCompletedLabel}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-iwb-slate-light">{totalWithdrawalsLabel}</p>
          <p className="mt-1.5 text-2xl font-bold text-iwb-error">
            ${totalWithdrawals.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-0.5 text-xs text-iwb-slate">{allTimeCompletedLabel}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-iwb-slate-light">{totalTransfersLabel}</p>
          <p className="mt-1.5 text-2xl font-bold text-iwb-navy">
            ${totalTransfers.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-0.5 text-xs text-iwb-slate">{completedTransactionsLabel}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-iwb-navy">{volume30DayLabel}</h3>
          {dailyData.length > 0 ? (
            <div className="space-y-2">
              {dailyData.map(([day, data]) => {
                const total = data.deposits + data.withdrawals + data.transfers;
                const pct = (total / maxDaily) * 100;
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs text-iwb-slate">{day}</span>
                    <div className="flex h-5 flex-1 overflow-hidden rounded-full bg-iwb-surface">
                      <div
                        className="h-full rounded-l-full bg-iwb-teal transition-all"
                        style={{ width: `${(data.deposits / maxDaily) * 100}%` }}
                      />
                      <div
                        className="h-full bg-iwb-navy transition-all"
                        style={{ width: `${(data.transfers / maxDaily) * 100}%` }}
                      />
                      <div
                        className="h-full rounded-r-full bg-iwb-error transition-all"
                        style={{ width: `${(data.withdrawals / maxDaily) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs font-medium text-iwb-navy">
                      ${total.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-iwb-slate">{noDataLabel}</p>
          )}

          <div className="mt-5 flex items-center gap-4 border-t border-iwb-border-light pt-4 text-xs text-iwb-slate">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-iwb-teal" /> {legendDeposits}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-iwb-navy" /> {legendTransfers}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-iwb-error" /> {legendWithdrawals}
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-iwb-navy">{topUsersLabel}</h3>
          {userBalances.length > 0 ? (
            <div className="space-y-3">
              {userBalances.map((u, i) => {
                const maxB = userBalances[0]?.balance ?? 1;
                const pct = (u.balance / maxB) * 100;
                return (
                  <div
                    key={u.email}
                    className="flex items-center gap-3"
                  >
                    <span className={`flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                      i === 0
                        ? "bg-iwb-teal/10 text-iwb-teal"
                        : i < 3
                          ? "bg-iwb-navy/5 text-iwb-slate"
                          : "bg-iwb-surface-dim text-iwb-slate-light"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-iwb-navy">{u.name}</p>
                      <p className="truncate text-xs text-iwb-slate">{u.email}</p>
                    </div>
                    <div className="w-32">
                      <div className="h-2 overflow-hidden rounded-full bg-iwb-surface">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-iwb-teal to-iwb-teal-dark transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-24 text-right text-sm font-semibold text-iwb-navy">
                      ${u.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-iwb-slate">{noUsersBalancesLabel}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
