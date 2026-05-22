"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Check if the account was deleted
  const serviceSupabase = createServiceClient();
  const { data: deletedProfile } = await serviceSupabase
    .from("profiles")
    .select("deleted_at")
    .eq("email", email)
    .not("deleted_at", "is", null)
    .maybeSingle();

  if (deletedProfile) {
    return { error: "Cannot register with this email." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  // Check if this email belongs to a deleted account
  const serviceSupabase = createServiceClient();
  const { data: deletedProfile } = await serviceSupabase
    .from("profiles")
    .select("deleted_at")
    .eq("email", email)
    .not("deleted_at", "is", null)
    .maybeSingle();

  if (deletedProfile) {
    return { error: "Cannot register with this email." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
