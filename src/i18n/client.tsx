"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale, type Locale } from "./config";
import { loadDictionary, getNestedValue, interpolate, type Dict } from "./dictionary";
import { updateLanguage } from "@/lib/actions/settings";

interface LocaleContextValue {
  locale: Locale;
  t: (key: string, params?: Record<string, string>) => string;
  setLocale: (locale: Locale) => Promise<void>;
  isLoaded: boolean;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  t: (key: string) => key,
  setLocale: async () => {},
  isLoaded: false,
});

export function useLocale() {
  return useContext(LocaleContext);
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match && match[2] ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function detectInitialLocale(): Locale {
  const cookie = getCookie("iwb_locale");
  if (cookie) {
    const supported = ["en", "es", "fr"];
    if (supported.includes(cookie)) return cookie as Locale;
  }
  if (typeof navigator !== "undefined") {
    const lang = navigator.language.split("-")[0]!;
    if (["en", "es", "fr"].includes(lang)) return lang as Locale;
  }
  return defaultLocale;
}

export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale: string }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(
    ["en", "es", "fr"].includes(initialLocale) ? (initialLocale as Locale) : detectInitialLocale(),
  );
  const [dict, setDict] = useState<Dict>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadDictionary(locale).then((d) => {
      setDict(d);
      setIsLoaded(true);
    });
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      const val = getNestedValue(dict, key);
      return interpolate(val, params);
    },
    [dict],
  );

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    setCookie("iwb_locale", newLocale, 365);
    try {
      await updateLanguage(newLocale);
    } catch {
      // server update is best-effort; cookie is already set
    }
    router.refresh();
  }, [router]);

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale, isLoaded }}>
      {children}
    </LocaleContext.Provider>
  );
}
