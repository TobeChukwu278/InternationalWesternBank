import type { Locale } from "./config";

export type Dict = Record<string, string | Record<string, unknown>>;

const cache = new Map<Locale, Dict>();

export async function loadDictionary(locale: Locale): Promise<Dict> {
  if (cache.has(locale)) return cache.get(locale)!;
  const dict = (await import(`./locales/${locale}.json`)) as Dict;
  cache.set(locale, dict);
  return dict;
}

export function getNestedValue(obj: Dict, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (typeof current !== "object" || current === null) return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

export function interpolate(text: string, params?: Record<string, string>): string {
  if (!params) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key as string] ?? `{{${key}}}`);
}
