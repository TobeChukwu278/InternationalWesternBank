import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, accounts(*)")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">
          Welcome, {profile?.full_name ?? "User"}
        </h1>
        <p className="mt-1 text-sm text-iwb-slate">
          Here&apos;s your financial overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-iwb-navy p-6 text-white">
          <p className="text-sm text-iwb-slate-light">Total Balance</p>
          <p className="mt-2 text-3xl font-bold">$0.00</p>
          <p className="mt-1 text-xs text-iwb-slate-light">
            Account: ****{profile?.accounts?.[0]?.account_number?.slice(-4) ?? "0000"}
          </p>
        </Card>
      </div>
    </div>
  );
}
