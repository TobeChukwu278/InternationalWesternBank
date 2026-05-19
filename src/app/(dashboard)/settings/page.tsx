import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: account } = await supabase
    .from("accounts")
    .select("account_number")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <SettingsClient
      profile={{
        full_name: profile.full_name,
        email: user.email ?? "",
        notifications_enabled: profile.notifications_enabled ?? true,
        preferred_currency: profile.preferred_currency ?? "USD",
        theme: profile.theme ?? "light",
        created_at: profile.created_at,
      }}
      account={{
        account_number: account?.account_number ?? "N/A",
      }}
      userId={user.id}
    />
  );
}
