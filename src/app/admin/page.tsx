import { createServiceClient } from "@/lib/supabase/service";
import { Card } from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = createServiceClient();

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: accountCount } = await supabase
    .from("accounts")
    .select("*", { count: "exact", head: true });

  const { count: transactionCount } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true });

  const { data: recentTxs } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-iwb-slate">Platform overview and management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-iwb-slate-light">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-iwb-navy">{userCount ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-iwb-slate-light">Total Accounts</p>
          <p className="mt-1 text-2xl font-bold text-iwb-navy">{accountCount ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-iwb-slate-light">Transactions</p>
          <p className="mt-1 text-2xl font-bold text-iwb-navy">{transactionCount ?? 0}</p>
        </Card>
      </div>

      <Card>
        <div className="border-b border-iwb-border-light px-6 py-4">
          <h3 className="text-sm font-semibold text-iwb-navy">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-iwb-border-light">
          {recentTxs?.length ? (
            recentTxs.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-iwb-navy">
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} — ${Number(tx.amount).toFixed(2)}
                  </p>
                  <p className="truncate text-xs text-iwb-slate">
                    {tx.description ?? tx.reference.slice(0, 24)}
                  </p>
                </div>
                <span className="text-xs text-iwb-slate">
                  {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-iwb-slate">No transactions yet</div>
          )}
        </div>
      </Card>
    </div>
  );
}
