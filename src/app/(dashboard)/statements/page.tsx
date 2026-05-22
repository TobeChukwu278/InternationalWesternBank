import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { t } from "@/i18n/server";

export default async function StatementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("accounts")
    .select("id, sub_accounts(id)")
    .eq("user_id", user.id)
    .single();

  if (!account) redirect("/dashboard");

  const subAccountIds = (account.sub_accounts as { id: string }[]).map((s) => s.id);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .or(
      `from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`,
    )
    .order("created_at", { ascending: false });

  const [depositLabel, withdrawalLabel] = await Promise.all([
    t('transactions.deposit'),
    t('transactions.withdrawal'),
  ]);

  const byMonth: Record<string, { deposits: number; withdrawals: number; count: number }> = {};
  for (const tx of transactions ?? []) {
    const month = new Date(tx.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!byMonth[month]) byMonth[month] = { deposits: 0, withdrawals: 0, count: 0 };
    const entry = byMonth[month];
    if (tx.type === "deposit") entry.deposits += Number(tx.amount);
    else if (tx.type === "withdrawal") entry.withdrawals += Number(tx.amount);
    else if (tx.type === "transfer" && tx.from_sub_account_id && subAccountIds.includes(tx.from_sub_account_id))
      entry.withdrawals += Number(tx.amount);
    else entry.deposits += Number(tx.amount);
    entry.count++;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">{await t('statements.title')}</h1>
        <p className="mt-1 text-sm text-iwb-slate">{await t('statements.subtitle')}</p>
      </div>

      {Object.keys(byMonth).length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-iwb-slate">No transactions yet. Statements will appear here once you have activity.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byMonth).map(([month, data]) => (
            <Card key={month} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-iwb-border-light px-6 py-4">
                <h3 className="text-sm font-semibold text-iwb-navy">{month}</h3>
                <span className="text-xs text-iwb-slate-light">{data.count} transactions</span>
              </div>
              <div className="grid grid-cols-2 gap-4 px-6 py-4">
                <div>
                  <p className="text-xs text-iwb-slate-light">{depositLabel}</p>
                  <p className="text-lg font-semibold text-iwb-teal">
                    +${data.deposits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-iwb-slate-light">{withdrawalLabel}</p>
                  <p className="text-lg font-semibold text-iwb-error">
                    -${data.withdrawals.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="border-t border-iwb-border-light px-6 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-iwb-slate">Net change</span>
                  <span className={`font-semibold ${data.deposits - data.withdrawals >= 0 ? "text-iwb-teal" : "text-iwb-error"}`}>
                    {data.deposits - data.withdrawals >= 0 ? "+" : "-"}$
                    {Math.abs(data.deposits - data.withdrawals).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
