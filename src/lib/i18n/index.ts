import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALES,
  LOCALE_LABELS,
  normalizeLocale,
  type Locale,
} from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";
export {
  pickLocalizedName,
  pickLocalizedDescription,
  type LocalizedNames,
  type LocalizedDescriptions,
} from "./localize";

export async function getServerLocale(): Promise<Locale> {
  const jar = await cookies();
  return normalizeLocale(jar.get(LOCALE_COOKIE)?.value);
}

export async function getServerDictionary(): Promise<{
  locale: Locale;
  t: Dictionary;
}> {
  const locale = await getServerLocale();
  return { locale, t: getDictionary(locale) };
}

export { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, LOCALE_LABELS, normalizeLocale };
export type { Locale, Dictionary };
