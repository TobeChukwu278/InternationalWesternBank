"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdminSession } from "@/lib/admin-auth";
import { createNotificationSystem } from "@/lib/actions/notifications";

export async function signupWithKyc(formData: FormData) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const dateOfBirth = formData.get("date_of_birth") as string;
  const addressLine1 = formData.get("address_line1") as string;
  const addressCity = formData.get("address_city") as string;
  const addressState = formData.get("address_state") as string;
  const addressZip = formData.get("address_zip") as string;
  const avatarUrl = formData.get("avatar_url") as string;
  const idFrontUrl = formData.get("id_document_front") as string;
  const idBackUrl = formData.get("id_document_back") as string;
  const ssnLastFour = formData.get("ssn_last_four") as string;

  if (!email || !password || !fullName) return { error: "Missing required fields" };

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Failed to create user" };

  const svc = createServiceClient();

  const { error: updateError } = await svc
    .from("profiles")
    .update({
      phone: phone || null,
      date_of_birth: dateOfBirth || null,
      address_line1: addressLine1 || null,
      address_city: addressCity || null,
      address_state: addressState || null,
      address_zip: addressZip || null,
      avatar_url: avatarUrl || null,
      id_document_front: idFrontUrl || null,
      id_document_back: idBackUrl || null,
      ssn_last_four: ssnLastFour || null,
      status: "pending",
      kyc_status: "pending",
    })
    .eq("id", authData.user.id);

  if (updateError) return { error: `Failed to save profile: ${updateError.message}` };

  await createNotificationSystem(
    authData.user.id,
    "Registration Submitted",
    "Your account registration has been submitted and is pending verification. We'll notify you once it's approved.",
    "system",
  );

  revalidatePath("/", "layout");
  return { success: true, userId: authData.user.id };
}

export async function updateKycDocumentUrls(formData: FormData) {
  const svc = createServiceClient();
  const userId = formData.get("user_id") as string;
  if (!userId) return { error: "Missing user ID" };

  const updates: Record<string, string> = {};
  for (const field of ["avatar_url", "id_document_front", "id_document_back"] as const) {
    const val = formData.get(field) as string | null;
    if (val) updates[field] = val;
  }

  if (Object.keys(updates).length === 0) return { success: true };

  const { error } = await svc
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function uploadStorageFile(formData: FormData) {
  const svc = createServiceClient();
  const bucket = formData.get("bucket") as string;
  const path = formData.get("path") as string;
  const file = formData.get("file") as File;

  if (!bucket || !path || !file) return { error: "Missing upload fields" };

  const arrayBuffer = await file.arrayBuffer();

  const { error } = await svc.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) return { error: error.message };

  const { data: urlData } = await svc.storage
    .from(bucket)
    .getPublicUrl(path);

  return { url: urlData?.publicUrl ?? null };
}

export async function getDocumentSignedUrl(bucket: string, filePath: string) {
  const svc = createServiceClient();
  const { data } = await svc.storage
    .from(bucket)
    .createSignedUrl(filePath, 3600);
  return data?.signedUrl ?? null;
}

export async function approveKyc(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const userId = formData.get("user_id") as string;
  if (!userId) return { error: "Missing user ID" };

  const svc = createServiceClient();

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const reviewerId = user?.id ?? "00000000-0000-0000-0000-000000000000";

  const { error } = await svc
    .from("profiles")
    .update({
      status: "active",
      kyc_status: "verified",
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  await createNotificationSystem(
    userId,
    "Account Approved",
    "Your account has been verified and approved. You can now access all IWB banking services.",
    "system",
  );

  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function rejectKyc(formData: FormData) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return { error: "Not authorized" };

  const userId = formData.get("user_id") as string;
  const reason = formData.get("reason") as string;
  if (!userId) return { error: "Missing user ID" };
  if (!reason) return { error: "Rejection reason is required" };

  const svc = createServiceClient();

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const reviewerId = user?.id ?? "00000000-0000-0000-0000-000000000000";

  const { error } = await svc
    .from("profiles")
    .update({
      status: "rejected",
      kyc_status: "rejected",
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  await createNotificationSystem(
    userId,
    "Account Rejected",
    `Your account registration has been rejected. Reason: ${reason}. Please contact support for more information.`,
    "system",
  );

  revalidatePath("/admin", "layout");
  return { success: true };
}
