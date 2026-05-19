import { createServiceClient } from "@/lib/supabase/service";
import { DepositActions } from "./deposit-actions";

export default async function AdminDepositsPage() {
  const svc = createServiceClient();

  const { data: pendingDeposits } = await svc
    .from("transactions")
    .select("*, sub_accounts!to_sub_account_id(accounts!inner(profiles!inner(full_name, email)))")
    .eq("type", "deposit")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const pendingItems = (pendingDeposits ?? []).map((tx: any) => ({
    id: tx.id,
    amount: Number(tx.amount),
    reference: tx.reference,
    description: tx.description ?? "",
    createdAt: tx.created_at,
    userFullName: tx.sub_accounts?.accounts?.profiles?.full_name ?? "Unknown",
    userEmail: tx.sub_accounts?.accounts?.profiles?.email ?? "Unknown",
  }));

  const { data: completedDeposits } = await svc
    .from("transactions")
    .select("*")
    .eq("type", "deposit")
    .in("status", ["completed", "failed"])
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Deposits</h1>
        <p className="mt-1 text-sm text-iwb-slate">Manage pending deposit requests</p>
      </div>

      {/* Pending Deposits */}
      <div>
        <h2 className="text-lg font-semibold text-iwb-navy mb-4">
          Pending Confirmations
          {pendingItems.length > 0 ? (
            <span className="ml-2 rounded-iwb-full bg-iwb-error/10 px-2.5 py-0.5 text-xs font-medium text-iwb-error">
              {pendingItems.length}
            </span>
          ) : null}
        </h2>

        {pendingItems.length === 0 ? (
          <div className="rounded-iwb-xl bg-white p-12 text-center shadow-iwb-card">
            <i className="material-icons text-4xl text-iwb-slate-light mb-3">check_circle</i>
            <p className="text-base font-medium text-iwb-navy">No pending deposits</p>
            <p className="mt-1 text-sm text-iwb-slate">All deposit requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="rounded-iwb-lg bg-white shadow-iwb-card border border-iwb-border-light overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-iwb-navy/5">
                        <i className="material-icons text-iwb-slate">schedule</i>
                      </span>
                      <div>
                        <p className="text-sm font-medium text-iwb-navy">{item.userFullName}</p>
                        <p className="text-xs text-iwb-slate-light">{item.userEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-iwb-navy">
                        ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-iwb-slate-light">Reference:</span>
                      <span className="ml-1 font-mono text-iwb-navy">{item.reference}</span>
                    </div>
                    <div>
                      <span className="text-iwb-slate-light">Date:</span>
                      <span className="ml-1 text-iwb-navy">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-iwb-slate-light">Details:</span>
                      <span className="ml-1 text-iwb-navy">{item.description}</span>
                    </div>
                  </div>
                </div>

                <DepositActions transactionId={item.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent History */}
      <div>
        <h2 className="text-lg font-semibold text-iwb-navy mb-4">Recent History</h2>
        {(completedDeposits ?? []).length === 0 ? (
          <p className="text-sm text-iwb-slate">No completed or rejected deposits yet</p>
        ) : (
          <div className="rounded-iwb-xl bg-white shadow-iwb-card overflow-hidden">
            <div className="divide-y divide-iwb-border-light">
              {(completedDeposits ?? []).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-8 items-center justify-center rounded-full text-xs ${
                        tx.status === "completed"
                          ? "bg-iwb-teal/10 text-iwb-teal"
                          : "bg-iwb-error/10 text-iwb-error"
                      }`}
                    >
                      <i className="material-icons text-sm">
                        {tx.status === "completed" ? "check" : "close"}
                      </i>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-iwb-navy capitalize">{tx.status}</p>
                      <p className="text-xs text-iwb-slate-light font-mono">{tx.reference}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-iwb-navy">
                      ${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-iwb-slate-light">
                      {new Date(tx.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
