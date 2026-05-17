import Link from "next/link";
import { logout } from "@/lib/actions/auth";

const tabs = [
  { label: "Home", href: "/dashboard", icon: "Home" },
  { label: "Transactions", href: "/transactions", icon: "ArrowUpDown" },
  { label: "Send", href: "/send", icon: "Send" },
];

export function MobileNav() {
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
