"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALES,
  normalizeLocale,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";

type I18nContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    normalizeLocale(initialLocale)
  );

  useEffect(() => {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
    if (match) {
      setLocaleState(normalizeLocale(match.split("=")[1]));
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    const locale = normalizeLocale(next);
    setLocaleState(locale);
    writeLocaleCookie(locale);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      t: getDictionary(locale),
      setLocale,
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      t: getDictionary(DEFAULT_LOCALE),
      setLocale: () => undefined,
    };
  }
  return ctx;
}

export function useT() {
  return useI18n().t;
}

export { LOCALES };
