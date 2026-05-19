"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Notification, NotificationType } from "@/types/database";

export async function getNotifications(
  limit = 50,
  offset = 0,
): Promise<{ notifications: Notification[]; total: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { notifications: [], total: 0 };

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) return { notifications: [], total: 0 };

  return {
    notifications: (notifications ?? []) as Notification[],
    total: count ?? 0,
  };
}

export async function getUnreadNotifications(
  limit = 5,
): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { notifications: [], unreadCount: 0 };

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return {
    notifications: (notifications ?? []) as Notification[],
    unreadCount: count ?? 0,
  };
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/notifications", "layout");
  return { success: true };
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  revalidatePath("/notifications", "layout");
  return { success: true };
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  reference?: string,
) {
  const supabase = await createClient();

  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    reference: reference ?? null,
  });
}

export async function createNotificationSystem(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  reference?: string,
) {
  const { createServiceClient } = await import("@/lib/supabase/service");
  const svc = createServiceClient();

  await svc.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    reference: reference ?? null,
  });
}
