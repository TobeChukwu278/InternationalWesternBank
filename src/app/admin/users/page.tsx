import { createServiceClient } from "@/lib/supabase/service";
import { Card } from "@/components/ui/card";
import { AdminUserActions } from "@/components/features/admin-user-actions";
import { t } from "@/i18n/server";

export default async function AdminUsersPage() {
  const supabase = createServiceClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*, accounts!inner(*, sub_accounts(*))")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const flatUsers = (users ?? []).map((profile) => {
    const acct = Array.isArray(profile.accounts) ? profile.accounts[0] : (profile.accounts as Record<string, unknown> | null);
    const subAccounts = ((acct as { sub_accounts?: unknown[] })?.sub_accounts ?? []) as {
      id: string;
      type: string;
      balance: number;
      currency: string;
      is_default: boolean;
    }[];
    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      created_at: profile.created_at,
      account_number: (acct as { account_number?: string })?.account_number ?? "N/A",
      sub_accounts: subAccounts,
      total_balance: subAccounts.reduce((s, sa) => s + Number(sa.balance), 0),
    };
  });

  const [
    usersTitle,
    registeredLabel,
    totalLabel,
    userCol,
    accountCol,
    balanceCol,
    subAccountsCol,
    joinedCol,
    actionsCol,
    noUsersYet,
    noUsersDesc,
  ] = await Promise.all([
    t("nav.users"),
    flatUsers.length === 1 ? t("admin.users.registeredCount", { count: String(flatUsers.length) }) : t("admin.users.registeredCountPlural", { count: String(flatUsers.length) }),
    t("admin.users.totalLabel"),
    t("admin.users.nameCol"),
    t("admin.users.accountCol"),
    t("admin.users.balanceCol"),
    t("admin.users.subAccountsCol"),
    t("admin.users.joinedCol"),
    t("admin.users.actionsCol"),
    t("admin.users.noUsersYet"),
    t("admin.users.noUsersDesc"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-iwb-navy">{usersTitle}</h1>
          <p className="mt-1 text-sm text-iwb-slate">
            {registeredLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-iwb-lg bg-iwb-teal/10 px-4 py-2">
          <span className="text-2xl font-bold text-iwb-navy">{flatUsers.length}</span>
          <span className="text-xs text-iwb-slate">{totalLabel}</span>
        </div>
      </div>

      <Card>
        <div className="border-b border-iwb-border-light">
          <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:px-6 md:py-3.5">
            <div className="col-span-3 text-xs font-medium uppercase tracking-wider text-iwb-slate-light">
              {userCol}
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-iwb-slate-light">
              {accountCol}
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-iwb-slate-light">
              {balanceCol}
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-iwb-slate-light">
              {subAccountsCol}
            </div>
            <div className="col-span-1 text-xs font-medium uppercase tracking-wider text-iwb-slate-light">
              {joinedCol}
            </div>
            <div className="col-span-2 text-right text-xs font-medium uppercase tracking-wider text-iwb-slate-light">
              {actionsCol}
            </div>
          </div>
        </div>

        <div className="divide-y divide-iwb-border-light">
          {flatUsers.map((user) => (
            <div
              key={user.id}
              className="px-6 py-4 transition-colors hover:bg-iwb-surface/50"
            >
              <div className="md:grid md:grid-cols-12 md:items-center md:gap-4">
                <div className="col-span-3 mb-2 md:mb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-iwb-navy text-xs font-bold text-white">
                      {user.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-iwb-navy">
                        {user.full_name}
                      </p>
                      <p className="truncate text-xs text-iwb-slate md:hidden">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 mb-2 md:mb-0">
                  <p className="text-sm font-mono text-iwb-slate">{user.account_number}</p>
                  <p className="truncate hidden text-xs text-iwb-slate-light md:block">
                    {user.email}
                  </p>
                </div>

                <div className="col-span-2 mb-2 md:mb-0">
                  <p className="text-sm font-semibold text-iwb-navy">
                    ${user.total_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="mt-1 flex gap-1">
                    {user.sub_accounts.map((sa) => (
                      <span
                        key={sa.id}
                        className={`rounded-iwb-full px-1.5 py-0.5 text-[10px] font-medium ${
                          Number(sa.balance) > 0
                            ? "bg-iwb-teal/10 text-iwb-teal"
                            : "bg-iwb-surface-dim text-iwb-slate-light"
                        }`}
                      >
                        {sa.type.charAt(0).toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 mb-2 md:mb-0">
                  <div className="flex flex-wrap gap-1.5">
                    {user.sub_accounts.map((sa) => (
                      <span
                        key={sa.id}
                        className="rounded-iwb-md border border-iwb-border-light px-2 py-1 text-xs text-iwb-slate"
                      >
                        {sa.type}: $
                        {Number(sa.balance).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-span-1 mb-2 md:mb-0">
                  <p className="text-xs text-iwb-slate">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="col-span-2 text-right">
                  <AdminUserActions user={user} />
                </div>
              </div>
            </div>
          ))}

          {flatUsers.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-16">
              <div className="flex size-14 items-center justify-center rounded-full bg-iwb-surface">
                <svg className="size-7 text-iwb-slate-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-iwb-navy">{noUsersYet}</p>
              <p className="text-xs text-iwb-slate">{noUsersDesc}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
