"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const notificationsEnabled = formData.get("notifications_enabled") === "true";
  const preferredCurrency = formData.get("preferred_currency") as string;
  const theme = formData.get("theme") as string;

  if (!["USD", "EUR", "GBP"].includes(preferredCurrency)) {
    return { error: "Invalid currency" };
  }
  if (!["light", "dark"].includes(theme)) {
    return { error: "Invalid theme" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ notifications_enabled: notificationsEnabled, preferred_currency: preferredCurrency, theme })
    .eq("id", user.id);

  if (error) return { error: error.message };

  const cookieStore = await cookies();
  cookieStore.set("preferred_currency", preferredCurrency, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  cookieStore.set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  revalidatePath("/settings", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/accounts", "layout");

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Current password is incorrect" };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) return { error: updateError.message };

  revalidatePath("/settings", "layout");
  return { success: true };
}

export async function updateLanguage(locale: string) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const supported = ["en", "es", "fr", "it"];
  if (!supported.includes(locale)) return { error: "Unsupported locale" };

  const { createServiceClient } = await import("@/lib/supabase/service");
  const svc = createServiceClient();
  const { error } = await svc.from("profiles").update({ language: locale }).eq("id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}
