import Link from "next/link";
import { LanguageSwitcher } from "@/components/features/language-switcher";
import { t } from "@/i18n/server";

export async function Footer() {
  return (
    <footer className="bg-iwb-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="IWB" className="size-8" />
              <span className="font-semibold">International WB</span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              {await t("marketing.footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              {await t("marketing.footer.company")}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.home")}</Link></li>
              <li><Link href="/services" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.services")}</Link></li>
              <li><Link href="/about" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.about")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              {await t("marketing.footer.support")}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.contact")}</Link></li>
              <li><span className="text-sm text-white/70">{await t("marketing.footer.privacy")}</span></li>
              <li><Link href="/login" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.signIn")}</Link></li>
              <li><Link href="/signup" className="text-sm text-white/70 transition-colors hover:text-white">{await t("marketing.nav.getStarted")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              {await t("marketing.footer.contact")}
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>249 E Ocean Blvd, Long Beach, CA 90802</li>
              <li>+1 (786) 245-4920</li>
              <li>support@internationalwb.com</li>
            </ul>
            <div className="mt-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} International Western Bank. {await t("marketing.footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
