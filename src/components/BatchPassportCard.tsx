import type { Characteristic } from "@/lib/utils";

export type PassportField = {
  label: string;
  value: string;
  /** Optional secondary line under the value (e.g. EN translation) */
  subValue?: string;
};

type Props = {
  photoUrl?: string | null;
  photoAlt?: string;
  /** Top line, e.g. O'ZBEKISTON RESPUBLIKASI */
  countryLine: string;
  /** Main document title */
  docTitle: string;
  /** Subtitle under title (RU / EN) */
  docSubtitle: string;
  fields: PassportField[];
  idNumber: string;
  idLabel: string;
  watermark: string;
};

export function BatchPassportCard({
  photoUrl,
  photoAlt = "",
  countryLine,
  docTitle,
  docSubtitle,
  fields,
  idNumber,
  idLabel,
  watermark,
}: Props) {
  return (
    <article className="id-card" aria-label={docTitle}>
      <div className="id-card__pattern" aria-hidden />
      <p className="id-card__watermark" aria-hidden>
        {watermark}
      </p>

      <header className="id-card__header">
        <div className="id-card__flag" aria-hidden>
          <span className="id-card__flag-b" />
          <span className="id-card__flag-w" />
          <span className="id-card__flag-g" />
        </div>
        <div className="id-card__titles">
          <p className="id-card__country">{countryLine}</p>
          <h1 className="id-card__doc-title">{docTitle}</h1>
          <p className="id-card__doc-sub">{docSubtitle}</p>
        </div>
        <div className="id-card__badge" aria-hidden>
          <span>ID</span>
        </div>
      </header>

      <div className="id-card__body">
        <div className="id-card__left">
          <div className="id-card__photo">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={photoAlt} />
            ) : (
              <div className="id-card__photo-empty" aria-hidden>
                <svg viewBox="0 0 64 80" className="id-card__silhouette">
                  <circle cx="32" cy="24" r="14" fill="#9aa8b5" />
                  <path
                    d="M8 72c4-18 14-28 24-28s20 10 24 28"
                    fill="#9aa8b5"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        <ol className="id-card__fields">
          {fields.map((field, i) => (
            <li key={`${field.label}-${i}`} className="id-card__row">
              <span className="id-card__num" aria-hidden>
                {i + 1}.
              </span>
              <div className="id-card__field">
                <span className="id-card__label">{field.label}</span>
                <span className="id-card__value">{field.value}</span>
                {field.subValue ? (
                  <span className="id-card__sub">{field.subValue}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <footer className="id-card__footer">
        <span className="id-card__id-label">{idLabel}</span>
        <span className="id-card__id">{idNumber}</span>
      </footer>
    </article>
  );
}

/** Build ID-style rows from batch product data + characteristics */
export function buildPassportFields(opts: {
  productLabel: string;
  productName: string;
  skuLabel: string;
  sku: string;
  batchLabel: string;
  batchNumber: string;
  dateLabel: string;
  manufacturedAt: string;
  categoryLabel?: string;
  category?: string;
  unitLabel?: string;
  unit?: string;
  characteristics: Characteristic[];
  maxExtra?: number;
}): PassportField[] {
  const fields: PassportField[] = [
    { label: opts.productLabel, value: opts.productName },
    { label: opts.skuLabel, value: opts.sku },
    { label: opts.batchLabel, value: opts.batchNumber },
    { label: opts.dateLabel, value: opts.manufacturedAt },
  ];
  if (opts.category) {
    fields.push({
      label: opts.categoryLabel || "Category",
      value: opts.category,
    });
  }
  if (opts.unit) {
    fields.push({ label: opts.unitLabel || "Unit", value: opts.unit });
  }
  const maxExtra = opts.maxExtra ?? 6;
  for (const c of opts.characteristics.slice(0, maxExtra)) {
    fields.push({ label: c.key, value: c.value });
  }
  return fields;
}
