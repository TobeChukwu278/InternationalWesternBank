"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markAsRead, markAllAsRead } from "@/lib/actions/notifications";
import type { Notification } from "@/types/database";

interface NotificationListProps {
  notifications: Notification[];
  total: number;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const typeIcons: Record<string, string> = {
  transfer: "swap_horiz",
  deposit: "account_balance",
  system: "info",
};

const typeColors: Record<string, string> = {
  transfer: "bg-iwb-teal/10 text-iwb-teal",
  deposit: "bg-iwb-navy/10 text-iwb-navy",
  system: "bg-iwb-slate-light/10 text-iwb-slate",
};

export function NotificationList({ notifications: initial, total }: NotificationListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initial);

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex size-10 items-center justify-center rounded-full bg-white text-iwb-slate-light shadow-iwb-card transition-colors hover:bg-iwb-surface hover:text-iwb-navy"
          >
            <i className="material-icons">arrow_back</i>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-iwb-navy">Notifications</h1>
            <p className="text-sm text-iwb-slate">{total} total</p>
          </div>
        </div>
        {unreadCount > 0 ? (
          <button
            onClick={handleMarkAllRead}
            className="rounded-iwb-md border border-iwb-border px-4 py-2 text-sm font-medium text-iwb-slate transition-colors hover:border-iwb-teal hover:text-iwb-teal"
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-iwb-xl bg-white p-12 text-center shadow-iwb-card">
          <i className="material-icons text-4xl text-iwb-slate-light mb-3">notifications_none</i>
          <p className="text-base font-medium text-iwb-navy">No notifications yet</p>
          <p className="mt-1 text-sm text-iwb-slate">
            Notifications about your transfers and deposits will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`flex w-full items-start gap-4 rounded-iwb-lg p-4 text-left transition-all ${
                n.is_read
                  ? "bg-white shadow-iwb-card"
                  : "bg-iwb-teal/5 shadow-iwb-card border border-iwb-teal/20"
              }`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                  typeColors[n.type] ?? "bg-iwb-slate-light/10 text-iwb-slate"
                }`}
              >
                <i className="material-icons">{typeIcons[n.type] ?? "info"}</i>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${n.is_read ? "text-iwb-navy" : "font-semibold text-iwb-navy"}`}>
                    {n.title}
                  </p>
                  {!n.is_read ? (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-iwb-teal" />
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-iwb-slate">{n.message}</p>
                <p className="mt-1 text-xs text-iwb-slate-light">{timeAgo(n.created_at)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
