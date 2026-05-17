import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  if (q.length < 2) {
    return NextResponse.json({ recipients: [] });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ recipients: [] });
  }

  const serviceSupabase = createServiceClient();

  const { data: accounts } = await serviceSupabase
    .from("accounts")
    .select("account_number, user_id")
    .neq("user_id", user.id)
    .ilike("account_number", `%${q}%`)
    .limit(10);

  if (!accounts?.length) {
    return NextResponse.json({ recipients: [] });
  }

  const userIds = accounts.map((a) => a.user_id);

  const { data: profiles } = await serviceSupabase
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) ?? []);

  const recipients = accounts.map((a) => ({
    account_number: a.account_number,
    full_name: profileMap.get(a.user_id) ?? "Unknown",
  }));

  return NextResponse.json({ recipients });
}
