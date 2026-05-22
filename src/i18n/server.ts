import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";
import { loadDictionary, getNestedValue, interpolate, type Dict } from "./dictionary";

const dictCache = new Map<string, Dict>();

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const val = store.get("iwb_locale")?.value;
  if (val && (locales as readonly string[]).includes(val)) return val as Locale;
  return defaultLocale;
}

export async function getDict(): Promise<Dict> {
  const locale = await getServerLocale();
  if (dictCache.has(locale)) return dictCache.get(locale)!;
  const dict = await loadDictionary(locale);
  dictCache.set(locale, dict);
  return dict;
}

export async function t(key: string, params?: Record<string, string>): Promise<string> {
  const dict = await getDict();
  const val = getNestedValue(dict, key);
  return interpolate(val, params);
}
