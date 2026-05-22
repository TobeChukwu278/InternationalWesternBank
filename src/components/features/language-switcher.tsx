"use client";

import { useLocale } from "@/i18n/client";
import { localeLabels, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">
        Language / Idioma / Langue
      </label>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(localeLabels) as [Locale, string][]).map(([code, label]) => (
          <button
            key={code}
            onClick={() => setLocale(code)}
            className={`rounded-iwb-md px-4 py-2 text-sm font-medium transition-all ${
              locale === code
                ? "bg-iwb-teal text-iwb-navy"
                : "border border-iwb-border text-iwb-slate hover:border-iwb-teal hover:text-iwb-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
