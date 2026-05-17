import { createServiceClient } from "@/lib/supabase/service";
import { Card } from "@/components/ui/card";
import { AdminUserActions } from "@/components/features/admin-user-actions";

export default async function AdminUsersPage() {
  const supabase = createServiceClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*, accounts!inner(*, sub_accounts(*))")
    .order("created_at", { ascending: false });

  const flatUsers = (users ?? []).map((profile) => {
    const acct = Array.isArray(profile.accounts) ? profile.accounts[0] : null;
    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      created_at: profile.created_at,
      account_number: (acct as { account_number?: string })?.account_number ?? "N/A",
      sub_accounts: ((acct as { sub_accounts?: unknown[] })?.sub_accounts ?? []) as {
        id: string;
        type: string;
        balance: number;
        currency: string;
        is_default: boolean;
      }[],
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Users</h1>
        <p className="mt-1 text-sm text-iwb-slate">Manage user accounts and balances</p>
      </div>

      <Card>
        <div className="hidden border-b border-iwb-border-light px-6 py-3 text-xs font-medium uppercase tracking-wider text-iwb-slate-light md:grid md:grid-cols-12 md:gap-4">
          <span className="col-span-3">Name</span>
          <span className="col-span-3">Email</span>
          <span className="col-span-2">Account #</span>
          <span className="col-span-1">Subs</span>
          <span className="col-span-3">Actions</span>
        </div>
        <div className="divide-y divide-iwb-border-light">
          {flatUsers.map((user) => (
            <div key={user.id} className="px-6 py-4">
              <div className="md:grid md:grid-cols-12 md:items-start md:gap-4">
                <div className="col-span-3">
                  <p className="text-sm font-medium text-iwb-navy">{user.full_name}</p>
                  <p className="text-xs text-iwb-slate md:hidden">{user.email}</p>
                </div>
                <div className="hidden md:col-span-3 md:block">
                  <p className="truncate text-sm text-iwb-slate">{user.email}</p>
                </div>
                <div className="hidden md:col-span-2 md:block">
                  <p className="text-sm font-mono text-iwb-slate">{user.account_number}</p>
                </div>
                <div className="hidden md:col-span-1 md:block">
                  <p className="text-sm text-iwb-slate">{user.sub_accounts.length}</p>
                </div>
                <div className="col-span-3 mt-3 md:mt-0">
                  <AdminUserActions user={user} />
                </div>
              </div>
            </div>
          ))}
          {flatUsers.length === 0 && (
            <div className="p-6 text-center text-sm text-iwb-slate">No users found</div>
          )}
        </div>
      </Card>
    </div>
  );
}
