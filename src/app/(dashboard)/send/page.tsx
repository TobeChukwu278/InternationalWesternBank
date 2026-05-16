import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SendMoneyForm } from "@/components/features/send-money-form";

export default async function SendMoneyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("accounts")
    .select("*, sub_accounts(*)")
    .eq("user_id", user.id)
    .single();

  const subAccounts = account?.sub_accounts ?? [];

  if (!subAccounts.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-iwb-slate">No accounts available</p>
      </div>
    );
  }

  return <SendMoneyForm subAccounts={subAccounts} />;
}
