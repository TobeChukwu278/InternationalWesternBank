"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { markAsRead } from "@/lib/actions/notifications";
import type { Notification } from "@/types/database";

interface NotificationBellProps {
  initialUnreadCount: number;
  initialNotifications: Notification[];
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const typeIcons: Record<string, string> = {
  transfer: "swap_horiz",
  deposit: "account_balance",
  system: "info",
};

export function NotificationBell({ initialUnreadCount, initialNotifications }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState(initialNotifications);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex size-10 items-center justify-center rounded-full bg-white text-iwb-slate-light shadow-iwb-card transition-colors hover:bg-iwb-surface hover:text-iwb-navy"
        title="Notifications"
      >
        <i className="material-icons">notifications</i>
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-iwb-error px-1 text-[10px] font-bold leading-tight text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-iwb-lg bg-white shadow-iwb-overlay border border-iwb-border-light overflow-hidden">
          <div className="px-4 py-3 border-b border-iwb-border-light">
            <p className="text-sm font-semibold text-iwb-navy">Notifications</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <i className="material-icons text-2xl text-iwb-slate-light mb-2">notifications_none</i>
                <p className="text-sm text-iwb-slate">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-iwb-surface border-b border-iwb-border-light last:border-b-0"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal mt-0.5">
                    <i className="material-icons text-sm">{typeIcons[n.type] ?? "info"}</i>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-iwb-navy truncate">{n.title}</p>
                    <p className="text-xs text-iwb-slate line-clamp-2">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-iwb-slate-light">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 px-4 py-3 text-sm font-medium text-iwb-teal transition-colors hover:bg-iwb-teal/5 border-t border-iwb-border-light"
          >
            See all notifications
            <i className="material-icons text-sm">arrow_forward</i>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
