"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLocale } from "@/i18n/client";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-iwb-navy shadow-lg" : "bg-iwb-navy/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img src="/logo.png" alt="IWB" className="size-7 sm:size-8" />
          <span className="hidden sm:inline font-chivo text-base sm:text-lg font-bold text-white">International WB</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
          <Link
            href="/services"
            className="font-dm-sans text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            {t("marketing.nav.services")}
          </Link>
          <Link
            href="/about"
            className="font-dm-sans text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            {t("marketing.nav.about")}
          </Link>
          <Link
            href="/contact"
            className="font-dm-sans text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            {t("marketing.nav.contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-iwb-md border border-white/70 px-3 py-1.5 sm:px-4 sm:py-2 font-dm-sans text-xs sm:text-sm font-medium text-white transition-all hover:bg-white/10 whitespace-nowrap"
          >
            {t("marketing.nav.signIn")}
          </Link>
          <Link
            href="/signup"
            className="rounded-iwb-md bg-iwb-teal px-3 py-1.5 sm:px-4 sm:py-2 font-dm-sans text-xs sm:text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark whitespace-nowrap"
          >
            {t("marketing.nav.getStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
}
