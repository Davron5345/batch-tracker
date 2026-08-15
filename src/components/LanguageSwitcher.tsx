"use client";

import { LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/I18nProvider";

/** Cycle: uz → ru → en → uz (shown flag = language you switch to on click) */
const CYCLE: Locale[] = ["uz", "ru", "en"];

function nextLocale(current: Locale): Locale {
  const i = CYCLE.indexOf(current);
  const idx = i < 0 ? 0 : (i + 1) % CYCLE.length;
  return CYCLE[idx];
}

function FlagIcon({ locale }: { locale: Locale }) {
  if (locale === "uz") {
    return (
      <svg viewBox="0 0 36 24" className="lang-flag__svg" aria-hidden>
        <rect width="36" height="8" y="0" fill="#1eb8e6" />
        <rect width="36" height="8" y="8" fill="#fff" />
        <rect width="36" height="8" y="16" fill="#2f9e44" />
        <rect width="36" height="1.2" y="7.4" fill="#c8102e" />
        <rect width="36" height="1.2" y="15.4" fill="#c8102e" />
      </svg>
    );
  }
  if (locale === "ru") {
    return (
      <svg viewBox="0 0 36 24" className="lang-flag__svg" aria-hidden>
        <rect width="36" height="8" y="0" fill="#fff" />
        <rect width="36" height="8" y="8" fill="#0039a6" />
        <rect width="36" height="8" y="16" fill="#d52b1e" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 36 24" className="lang-flag__svg" aria-hidden>
      <rect width="36" height="24" fill="#012169" />
      <path d="M0 0 L36 24 M36 0 L0 24" stroke="#fff" strokeWidth="5" />
      <path d="M0 0 L36 24 M36 0 L0 24" stroke="#c8102e" strokeWidth="2.5" />
      <path d="M18 0 V24 M0 12 H36" stroke="#fff" strokeWidth="8" />
      <path d="M18 0 V24 M0 12 H36" stroke="#c8102e" strokeWidth="4.5" />
    </svg>
  );
}

export function LanguageSwitcher({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const { locale, setLocale } = useI18n();
  const target = nextLocale(locale);

  return (
    <div className={`lang-switch ${compact ? "lang-switch--compact" : ""} ${className}`}>
      <button
        type="button"
        className="lang-flag"
        onClick={() => {
          setLocale(target);
          window.location.reload();
        }}
        title={`${LOCALE_LABELS[target]} (${target.toUpperCase()})`}
        aria-label={`Сменить язык на ${LOCALE_LABELS[target]}`}
      >
        <FlagIcon locale={target} />
        <span className="lang-flag__code">{target.toUpperCase()}</span>
      </button>
    </div>
  );
}
