import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export async function AdminSidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <aside className="hidden lg:flex lg:w-[260px] shrink-0 flex-col bg-iwb-navy">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-iwb-teal/20">
          <span className="text-sm font-bold text-iwb-teal">A</span>
        </div>
        <div>
          <span className="block text-sm font-semibold text-white">Admin</span>
          <span className="block text-[10px] text-white/40">International WB</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <NavLink href="/admin/dashboard" label="Dashboard">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </NavLink>
        <NavLink href="/admin/users" label="Users">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </NavLink>
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-iwb-teal/20 text-xs font-bold text-iwb-teal">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.email}</p>
            <p className="text-[10px] text-iwb-teal/70">Admin</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white"
              title="Sign out"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
        <Link
          href="/dashboard"
          className="mt-3 flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
        >
          <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to app
        </Link>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
    >
      <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {children}
      </svg>
      {label}
    </Link>
  );
}
