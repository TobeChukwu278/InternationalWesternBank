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

  // Use service_role client to bypass RLS and find other users
  const serviceSupabase = createServiceClient();

  const { data: accounts } = await serviceSupabase
    .from("accounts")
    .select("account_number, profiles!inner(full_name)")
    .neq("user_id", user.id)
    .or(`account_number.ilike.%${q}%,profiles.full_name.ilike.%${q}%`)
    .limit(10);

  const recipients =
    accounts?.map((a) => ({
      account_number: a.account_number,
      full_name: (a.profiles as unknown as { full_name: string }).full_name,
    })) ?? [];

  return NextResponse.json({ recipients });
}
