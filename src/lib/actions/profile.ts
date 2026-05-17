"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const fullName = formData.get("full_name") as string;
  if (!fullName || fullName.trim().length < 1) return { error: "Name is required" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName.trim() })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings", "layout");
  revalidatePath("/dashboard", "layout");

  return { success: true };
}
