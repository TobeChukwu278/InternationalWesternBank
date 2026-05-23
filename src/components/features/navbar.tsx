import Link from "next/link";
import { t } from "@/i18n/server";

export async function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-iwb-navy/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="IWB" className="size-8" />
          <span className="font-semibold text-white">International WB</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/services" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
            {await t("marketing.nav.services")}
          </Link>
          <Link href="/about" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
            {await t("marketing.nav.about")}
          </Link>
          <Link href="/contact" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
            {await t("marketing.nav.contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            {await t("marketing.nav.signIn")}
          </Link>
          <Link
            href="/signup"
            className="rounded-iwb-md bg-iwb-teal px-4 py-2 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark"
          >
            {await t("marketing.nav.getStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
}
