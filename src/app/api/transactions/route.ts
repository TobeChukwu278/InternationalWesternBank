import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 15));
  const typeFilter = searchParams.get("type") || undefined;
  const statusFilter = searchParams.get("status") || undefined;
  const directionFilter = searchParams.get("direction") || undefined;
  const searchQuery = searchParams.get("search") || undefined;
  const categoryFilter = searchParams.get("category") || undefined;

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(id)")
    .eq("user_id", user.id)
    .single();

  if (!account) {
    return NextResponse.json({ transactions: [], page, totalPages: 0, totalCount: 0 });
  }

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

  const from = (page - 1) * limit;
  const { data: transactions, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  return NextResponse.json({
    transactions: transactions ?? [],
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
    totalCount: count ?? 0,
  });
}
