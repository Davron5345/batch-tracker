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

function FlagFill({ locale }: { locale: Locale }) {
  if (locale === "uz") {
    return (
      <svg viewBox="0 0 36 36" className="lang-orb__svg" aria-hidden>
        <defs>
          <clipPath id="lang-clip-uz">
            <circle cx="18" cy="18" r="18" />
          </clipPath>
        </defs>
        <g clipPath="url(#lang-clip-uz)">
          <rect width="36" height="12" y="0" fill="#1eb8e6" />
          <rect width="36" height="12" y="12" fill="#fff" />
          <rect width="36" height="12" y="24" fill="#2f9e44" />
          <rect width="36" height="1.5" y="11.25" fill="#c8102e" />
          <rect width="36" height="1.5" y="23.25" fill="#c8102e" />
        </g>
      </svg>
    );
  }
  if (locale === "ru") {
    return (
      <svg viewBox="0 0 36 36" className="lang-orb__svg" aria-hidden>
        <defs>
          <clipPath id="lang-clip-ru">
            <circle cx="18" cy="18" r="18" />
          </clipPath>
        </defs>
        <g clipPath="url(#lang-clip-ru)">
          <rect width="36" height="12" y="0" fill="#fff" />
          <rect width="36" height="12" y="12" fill="#0039a6" />
          <rect width="36" height="12" y="24" fill="#d52b1e" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 36 36" className="lang-orb__svg" aria-hidden>
      <defs>
        <clipPath id="lang-clip-en">
          <circle cx="18" cy="18" r="18" />
        </clipPath>
      </defs>
      <g clipPath="url(#lang-clip-en)">
        <rect width="36" height="36" fill="#012169" />
        <path d="M0 0 L36 36 M36 0 L0 36" stroke="#fff" strokeWidth="6" />
        <path d="M0 0 L36 36 M36 0 L0 36" stroke="#c8102e" strokeWidth="3" />
        <path d="M18 0 V36 M0 18 H36" stroke="#fff" strokeWidth="10" />
        <path d="M18 0 V36 M0 18 H36" stroke="#c8102e" strokeWidth="5.5" />
      </g>
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
        className="lang-orb"
        onClick={() => {
          setLocale(target);
          window.location.reload();
        }}
        title={LOCALE_LABELS[target]}
        aria-label={`Сменить язык на ${LOCALE_LABELS[target]}`}
      >
        <FlagFill locale={target} />
        <span className="lang-orb__gloss" aria-hidden />
      </button>
    </div>
  );
}
