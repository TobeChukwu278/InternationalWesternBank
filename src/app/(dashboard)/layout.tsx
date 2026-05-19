import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Sidebar } from "@/components/features/sidebar";
import { MobileNav } from "@/components/features/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const svc = createServiceClient();
  const { data: profile } = await svc
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single();

  if (profile?.status === "pending" || !profile) {
    redirect("/pending-verification");
  }

  if (profile?.status === "rejected") {
    redirect("/pending-verification?rejected=true");
  }

  return (
    <div className="flex bg-iwb-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0" style={{ height: "100dvh" }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
