import Link from "next/link";
import { logout } from "@/lib/actions/auth";

const tabs = [
  { label: "Home", href: "/dashboard" },
  { label: "Accounts", href: "/accounts" },
  { label: "Send", href: "/send" },
  { label: "Deposit", href: "/deposit" },
  { label: "More", href: "/transactions" },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center gap-1 overflow-x-auto border-t border-iwb-border-light bg-white px-2 lg:hidden">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className="flex shrink-0 flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-iwb-slate transition-colors hover:text-iwb-teal"
        >
          {tab.label === "Home" ? (
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ) : tab.label === "Accounts" ? (
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          ) : tab.label === "Send" ? (
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ) : tab.label === "Deposit" ? (
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          ) : (
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
          {tab.label}
        </Link>
      ))}
      <form action={logout} className="shrink-0">
        <button
          type="submit"
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-iwb-slate transition-colors hover:text-iwb-error"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </form>
    </nav>
  );
}
