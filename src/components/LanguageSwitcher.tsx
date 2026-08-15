"use client";

import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/I18nProvider";

export function LanguageSwitcher({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!compact && (
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {t.language}
        </span>
      )}
      <div className="inline-flex rounded-lg border border-[var(--border)] bg-white p-0.5">
        {LOCALES.map((code) => {
          const active = locale === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => {
                setLocale(code as Locale);
                // Refresh server components that read the cookie
                window.location.reload();
              }}
              className={`min-h-9 rounded-md px-2.5 text-xs font-bold uppercase ${
                active
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:bg-[#f4f6f8]"
              }`}
              aria-pressed={active}
              title={LOCALE_LABELS[code]}
            >
              {code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
