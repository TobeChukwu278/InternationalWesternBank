"use server";

import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession } from "@/lib/admin-auth";

export async function adminLogin(formData: FormData) {
  const password = formData.get("password") as string;
  if (!password) return { error: "Password is required" };

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "Invalid password" };
  }

  await createAdminSession();
  redirect("/admin/dashboard");
}

export async function adminLogout() {
  await destroyAdminSession();
  redirect("/admin");
}
