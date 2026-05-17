import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";

export default async function AdminPage() {
  const isAdmin = await isAdminSession();
  if (isAdmin) redirect("/admin/dashboard");
}
