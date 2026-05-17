import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "Home" },
  { label: "Transactions", href: "/transactions", icon: "ArrowUpDown" },
  { label: "Send Money", href: "/send", icon: "Send" },
];

export async function Sidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  return (
    <aside className="hidden lg:flex lg:w-[260px] shrink-0 flex-col bg-iwb-navy">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex size-8 items-center justify-center rounded-full bg-iwb-teal/20">
          <span className="text-sm font-bold text-iwb-teal">IWB</span>
        </div>
        <span className="font-semibold text-white">International WB</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <span className="size-5" />
            {item.label}
          </Link>
        ))}
        {admin ? (
          <Link
            href="/admin"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-iwb-teal/80 transition-colors hover:bg-white/5 hover:text-iwb-teal"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </Link>
        ) : null}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-iwb-teal/20 text-xs font-bold text-iwb-teal">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.email}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
              title="Sign out"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
