import { createServiceClient } from "@/lib/supabase/service";
import { Card } from "@/components/ui/card";
import { t } from "@/i18n/server";

export default async function AdminDashboardPage() {
  const supabase = createServiceClient();

  const [
    { count: userCount },
    { count: accountCount },
    { count: transactionCount },
    { count: completedCount },
    { count: todayTxCount },
    { data: recentTxs },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("accounts").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const { data: volumeData } = await supabase
    .from("transactions")
    .select("amount, created_at, type")
    .eq("status", "completed")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const totalVolume = (volumeData ?? []).reduce(
    (s, t) => s + Number(t.amount),
    0,
  );
  const depositVolume = (volumeData ?? [])
    .filter((t) => t.type === "deposit")
    .reduce((s, t) => s + Number(t.amount), 0);

  const [
    totalUsersLabel,
    totalAccountsLabel,
    transactionsLabel,
    todayLabel,
    sevenDayVolumeLabel,
    depositsSevenDayLabel,
    sevenDayVolumeShort,
    dashboardTitle,
    transactionActivityLabel,
    noActivityLabel,
    recentActivityLabel,
    noTransactionsLabel,
  ] = await Promise.all([
    t("admin.dashboard.totalUsers"),
    t("admin.dashboard.totalAccounts"),
    t("admin.dashboard.totalTransactions"),
    t("common.today"),
    t("admin.dashboard.sevenDayVolumeLabel"),
    t("admin.dashboard.depositsSevenDay"),
    t("admin.dashboard.sevenDayVolume"),
    t("nav.adminDashboard"),
    t("admin.dashboard.transactionActivity"),
    t("admin.dashboard.noActivitySevenDays"),
    t("admin.dashboard.recentActivity"),
    t("transactions.noTransactions"),
  ]);

  const stats = [
    {
      label: totalUsersLabel,
      value: userCount ?? 0,
      change: null,
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "text-iwb-navy",
      bg: "bg-iwb-navy/5",
    },
    {
      label: totalAccountsLabel,
      value: accountCount ?? 0,
      change: null,
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: "text-iwb-teal",
      bg: "bg-iwb-teal/10",
    },
    {
      label: transactionsLabel,
      value: transactionCount ?? 0,
      change: completedCount != null && transactionCount != null && transactionCount > 0
        ? `${Math.round((completedCount / transactionCount) * 100)}% ${await t("admin.transactions.completed")}`
        : null,
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: "text-iwb-slate",
      bg: "bg-iwb-navy/5",
    },
    {
      label: todayLabel,
      value: todayTxCount ?? 0,
      change: null,
      icon: (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "text-iwb-error",
      bg: "bg-iwb-error/5",
    },
  ];

  const volumeStats = [
    {
      label: sevenDayVolumeLabel,
      value: totalVolume,
      icon: null,
    },
    {
      label: depositsSevenDayLabel,
      value: depositVolume,
      icon: null,
    },
  ];

  const typeCounts = (volumeData ?? []).reduce(
    (acc, t) => {
      acc[t.type] = (acc[t.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-iwb-navy">{dashboardTitle}</h1>
          <p className="mt-1 text-sm text-iwb-slate">{today}</p>
        </div>
        <div className="flex items-center gap-2 rounded-iwb-lg bg-iwb-teal/10 px-4 py-2">
          <span className="text-lg font-bold text-iwb-navy">
            ${totalVolume.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </span>
          <span className="text-xs text-iwb-slate">{sevenDayVolumeShort}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 transition-all duration-200 hover:shadow-iwb-overlay">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-iwb-slate-light">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-2xl font-bold text-iwb-navy">
                  {typeof stat.value === "number" && stat.value > 0
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
                {stat.change ? (
                  <p className="mt-0.5 text-xs text-iwb-teal">{stat.change}</p>
                ) : null}
              </div>
              <span className={`flex size-10 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-iwb-navy">{transactionActivityLabel}</h3>
          {volumeData && volumeData.length > 0 ? (
            <div className="space-y-3">
              {Object.entries(typeCounts).map(([type, count]) => {
                const total = Object.values(typeCounts).reduce((s, c) => s + c, 0);
                const pct = (count / total) * 100;
                const colors: Record<string, string> = {
                  deposit: "bg-iwb-teal",
                  transfer: "bg-iwb-navy",
                  withdrawal: "bg-iwb-error",
                  internal_transfer: "bg-iwb-slate-light",
                };
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="w-28 text-xs font-medium capitalize text-iwb-slate">
                      {type.replace("_", " ")}
                    </span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-iwb-surface">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${colors[type] ?? "bg-iwb-slate-light"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-16 text-right text-xs font-medium text-iwb-navy">
                      {count}
                    </span>
                    <span className="w-12 text-right text-xs text-iwb-slate-light">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-iwb-slate">{noActivityLabel}</p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-iwb-border-light pt-5">
            {volumeStats.map((vs) => (
              <div key={vs.label}>
                <p className="text-xs text-iwb-slate-light">{vs.label}</p>
                <p className="mt-0.5 text-lg font-bold text-iwb-navy">
                  ${vs.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-iwb-navy">{recentActivityLabel}</h3>
          <div className="space-y-4">
            {recentTxs?.length ? (
              recentTxs.map((tx, i) => (
                <div
                  key={tx.id}
                  className="flex items-start gap-3"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      tx.type === "deposit"
                        ? "bg-iwb-teal/10 text-iwb-teal"
                        : tx.type === "withdrawal"
                          ? "bg-iwb-error/10 text-iwb-error"
                          : "bg-iwb-navy/5 text-iwb-slate"
                    }`}
                  >
                    {tx.type === "deposit"
                      ? "+"
                      : tx.type === "withdrawal"
                        ? "-"
                        : "⇄"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium capitalize text-iwb-navy">
                      {tx.type.replace("_", " ")}
                    </p>
                    <p className="truncate text-xs text-iwb-slate">
                      {tx.description ?? tx.reference.slice(0, 20)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-iwb-navy">
                      ${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-iwb-slate-light">
                      {new Date(tx.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-iwb-surface">
                  <svg className="size-5 text-iwb-slate-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="mt-3 text-sm text-iwb-slate">{noTransactionsLabel}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
