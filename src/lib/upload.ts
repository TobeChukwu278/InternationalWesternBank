"use client";

import { createClient } from "@/lib/supabase/client";

export async function uploadProfilePhoto(file: File, userId: string): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/profile.${ext}`;

  const { error } = await supabase.storage
    .from("profile-photos")
    .upload(path, file, { upsert: true });

  if (error) return null;

  const { data: urlData } = await supabase.storage
    .from("profile-photos")
    .getPublicUrl(path);

  return urlData?.publicUrl ?? null;
}

export async function uploadKycDocument(
  file: File,
  userId: string,
  side: "front" | "back",
): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/${side}.${ext}`;

  const { error } = await supabase.storage
    .from("kyc-documents")
    .upload(path, file, { upsert: true });

  if (error) return null;

  const { data: urlData } = await supabase.storage
    .from("kyc-documents")
    .getPublicUrl(path);

  return urlData?.publicUrl ?? null;
}
