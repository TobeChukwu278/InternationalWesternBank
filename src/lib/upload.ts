"use client";

import { uploadStorageFile } from "@/lib/actions/kyc";

export async function uploadProfilePhoto(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/profile.${ext}`;

  const formData = new FormData();
  formData.set("bucket", "profile-photos");
  formData.set("path", path);
  formData.set("file", file);

  const res = await uploadStorageFile(formData);
  if (res.error) {
    console.error("Profile photo upload failed:", res.error);
    return null;
  }
  return res.url ?? null;
}

export async function uploadKycDocument(
  file: File,
  userId: string,
  side: "front" | "back",
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${side}.${ext}`;

  const formData = new FormData();
  formData.set("bucket", "kyc-documents");
  formData.set("path", path);
  formData.set("file", file);

  const res = await uploadStorageFile(formData);
  if (res.error) {
    console.error("KYC document upload failed:", res.error);
    return null;
  }
  return res.url ?? null;
}
