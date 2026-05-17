import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(*)")
    .eq("user_id", user.id)
    .single();

  if (!account) redirect("/dashboard");

  const subAccounts = account.sub_accounts as {
    id: string;
    type: string;
    balance: number;
    currency: string;
    is_default: boolean;
    created_at: string;
  }[];
  const totalBalance = subAccounts.reduce((s, sa) => s + Number(sa.balance), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Accounts</h1>
        <p className="mt-1 text-sm text-iwb-slate">Manage your accounts</p>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-iwb-navy to-iwb-navy-light p-6 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-white/60">Account Number</p>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/70">
              Active
            </span>
          </div>
          <p className="mt-1 font-mono text-lg font-semibold tracking-wider">{account.account_number}</p>
          <p className="mt-4 text-xs text-white/60">Total Balance</p>
          <p className="text-3xl font-bold">${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {subAccounts.map((sa) => (
          <Card key={sa.id} className="p-5 transition-all hover:shadow-iwb-overlay">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-9 items-center justify-center rounded-lg text-xs font-bold ${
                      sa.type === "checking"
                        ? "bg-iwb-teal/10 text-iwb-teal"
                        : "bg-iwb-navy/5 text-iwb-slate"
                    }`}
                  >
                    {sa.type === "checking" ? "C" : "S"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold capitalize text-iwb-navy">{sa.type}</p>
                    <p className="text-xs text-iwb-slate">{sa.currency}</p>
                  </div>
                </div>
              </div>
              {sa.is_default ? (
                <span className="rounded-iwb-full bg-iwb-teal/10 px-2 py-0.5 text-[10px] font-medium text-iwb-teal">
                  Default
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-2xl font-bold text-iwb-navy">
              ${Number(sa.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-0.5 text-xs text-iwb-slate-light">
              Opened {new Date(sa.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
