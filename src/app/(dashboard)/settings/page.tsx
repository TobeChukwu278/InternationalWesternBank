import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/features/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">Settings</h1>
        <p className="mt-1 text-sm text-iwb-slate">Manage your profile</p>
      </div>

      <Card className="max-w-lg p-6">
        <h2 className="text-sm font-semibold text-iwb-navy">Profile</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-iwb-slate-light">Email</p>
            <p className="mt-0.5 text-sm text-iwb-navy">{user.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-iwb-slate-light">User ID</p>
            <p className="mt-0.5 font-mono text-xs text-iwb-slate">{user.id}</p>
          </div>
        </div>
      </Card>

      <Card className="max-w-lg p-6">
        <h2 className="text-sm font-semibold text-iwb-navy">Edit Name</h2>
        <SettingsForm currentName={profile?.full_name ?? ""} />
      </Card>
    </div>
  );
}
