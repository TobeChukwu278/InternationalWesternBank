import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

const tabs = [
  { label: "Home", href: "/dashboard", icon: "Home" },
  { label: "Transactions", href: "/transactions", icon: "ArrowUpDown" },
  { label: "Send", href: "/send", icon: "Send" },
];

export async function MobileNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t border-iwb-border-light bg-white lg:hidden">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs font-medium text-iwb-slate transition-colors hover:text-iwb-teal"
        >
          <span className="size-5" />
          {tab.label}
        </Link>
      ))}
      {admin ? (
        <Link
          href="/admin"
          className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs font-medium text-iwb-teal transition-colors hover:text-iwb-teal-dark"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Admin
        </Link>
      ) : null}
      <form action={logout}>
        <button
          type="submit"
          className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs font-medium text-iwb-slate transition-colors hover:text-iwb-error"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </form>
    </nav>
  );
}
