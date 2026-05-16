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
