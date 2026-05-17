import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransactionList } from "@/components/features/transaction-list";

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

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(id)")
    .eq("user_id", user.id)
    .single();

  if (!account) redirect("/login");

  const subAccountIds = (account.sub_accounts as { id: string }[]).map((sa) => sa.id);

  // Build query
  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .or(
      `from_sub_account_id.in.(${subAccountIds.join(",")}),to_sub_account_id.in.(${subAccountIds.join(",")})`,
    );

  if (typeFilter) {
    query = query.eq("type", typeFilter);
  }

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  if (directionFilter === "incoming") {
    query = query.not("to_sub_account_id", "is", null).in("to_sub_account_id", subAccountIds);
  } else if (directionFilter === "outgoing") {
    query = query.not("from_sub_account_id", "is", null).in("from_sub_account_id", subAccountIds);
  }

  if (searchQuery) {
    query = query.or(`description.ilike.%${searchQuery}%,reference.ilike.%${searchQuery}%`);
  }

  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const { data: transactions, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + ITEMS_PER_PAGE - 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Transactions</h1>
        <p className="mt-1 text-sm text-iwb-slate">
          View your complete transaction history
        </p>
      </div>

      <TransactionList
        transactions={transactions ?? []}
        subAccountIds={subAccountIds}
        totalCount={count ?? 0}
        searchParams={sp}
        currentPage={currentPage}
      />
    </div>
  );
}
