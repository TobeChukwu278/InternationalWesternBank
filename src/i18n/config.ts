export const defaultLocale = "en" as const;

export const locales = ["en", "es", "fr", "it"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  it: "Italiano",
};

export function isSupported(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return defaultLocale;
  const raw = navigator.language.split("-")[0] ?? defaultLocale;
  return isSupported(raw) ? raw : defaultLocale;
}
