import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransactionHistory } from "./transaction-history";

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

const ITEMS_PER_PAGE = 15;

export default async function TransactionsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp.page) || 1);
  const typeFilter = sp.type || undefined;
  const statusFilter = sp.status || undefined;
  const directionFilter = sp.direction || undefined;
  const searchQuery = sp.search || undefined;
  const categoryFilter = sp.category || undefined;

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(id, balance)")
    .eq("user_id", user.id)
    .single();

  if (!account) redirect("/login");

  const subAccountIds = (account.sub_accounts as { id: string }[]).map((sa) => sa.id);

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .or(
      `from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`,
    );

  if (typeFilter) query = query.eq("type", typeFilter);
  if (statusFilter) query = query.eq("status", statusFilter);
  if (categoryFilter) query = query.eq("category", categoryFilter);

  if (directionFilter === "incoming") {
    query = query.not("to_sub_account_id", "is", null).in("to_sub_account_id", subAccountIds);
  } else if (directionFilter === "outgoing") {
    query = query.not("from_sub_account_id", "is", null).in("from_sub_account_id", subAccountIds);
  }

  if (searchQuery) {
    query = query.or(
      `merchant_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,reference.ilike.%${searchQuery}%`,
    );
  }

  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const { data: transactions, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + ITEMS_PER_PAGE - 1);

  // Fetch total balance for the "Total Assets" badge
  const { data: fullAccount } = await supabase
    .from("accounts")
    .select("*, sub_accounts(balance)")
    .eq("user_id", user.id)
    .single();

  const totalBalance = (fullAccount?.sub_accounts as { balance: number }[] ?? [])
    .reduce((s, sa) => s + Number(sa.balance), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-iwb-navy">Transactions</h1>
          <p className="mt-1 text-sm text-iwb-slate">
            View your complete transaction history
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-iwb-lg bg-iwb-teal/10 px-4 py-2">
          <span className="text-2xl font-bold text-iwb-navy">
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </span>
          <span className="text-xs text-iwb-slate">Total Assets</span>
        </div>
      </div>

      <TransactionHistory
        key={JSON.stringify(sp)}
        initialTransactions={transactions ?? []}
        initialTotalCount={count ?? 0}
        initialPage={currentPage}
        searchParams={sp}
        subAccountIds={subAccountIds}
        accountNumber={account.account_number}
      />
    </div>
  );
}
