import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
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

  if (!account) return new NextResponse("No data", { status: 404 });

  const subAccountIds = (account.sub_accounts as { id: string }[]).map((sa) => sa.id);

  let query = supabase
    .from("transactions")
    .select("*")
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

  const { data: transactions } = await query.order("created_at", { ascending: false });

  const headers = ["Date", "Merchant", "Category", "Type", "Status", "Amount", "Reference"];
  const rows = (transactions ?? []).map((tx: Record<string, unknown>) => [
    new Date(tx.created_at as string).toISOString(),
    (tx.merchant_name as string) ?? "",
    (tx.category as string) ?? "",
    tx.type as string,
    tx.status as string,
    Number(tx.amount).toFixed(2),
    tx.reference as string,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
