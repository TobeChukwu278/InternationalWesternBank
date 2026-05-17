import { isAdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/features/admin-sidebar";
import { AdminLoginForm } from "@/components/features/admin-login-form";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isAdminSession();

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-iwb-surface px-4">
        <AdminLoginForm />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-iwb-surface">
      <AdminSidebar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
