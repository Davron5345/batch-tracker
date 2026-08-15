import type { Characteristic } from "@/lib/utils";

export type PassportField = {
  label: string;
  value: string;
};

type Props = {
  photoUrl?: string | null;
  photoAlt?: string;
  titleLeft: string;
  titleRight: string;
  fields: PassportField[];
  idNumber: string;
  watermark: string;
};

export function BatchPassportCard({
  photoUrl,
  photoAlt = "",
  titleLeft,
  titleRight,
  fields,
  idNumber,
  watermark,
}: Props) {
  return (
    <article className="batch-passport" aria-label={titleRight}>
      <div className="batch-passport__shine" aria-hidden />
      <div className="batch-passport__guilloche" aria-hidden />
      <p className="batch-passport__watermark" aria-hidden>
        {watermark}
      </p>

      <header className="batch-passport__header">
        <p className="batch-passport__title batch-passport__title--left">
          {titleLeft}
        </p>
        <div className="batch-passport__emblem" aria-hidden>
          <svg viewBox="0 0 64 64" className="batch-passport__emblem-svg">
            <circle cx="32" cy="32" r="30" fill="#c9a227" opacity="0.25" />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#b8860b"
              strokeWidth="1.5"
            />
            <circle cx="32" cy="22" r="8" fill="#e8c547" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="32"
                y1="10"
                x2="32"
                y2="14"
                stroke="#d4a017"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${deg} 32 22)`}
              />
            ))}
            <path
              d="M18 44c4-8 10-12 14-12s10 4 14 12"
              fill="none"
              stroke="#8b6914"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M26 40c2-4 4-5 6-5s4 1 6 5"
              fill="#8b6914"
              opacity="0.85"
            />
          </svg>
        </div>
        <p className="batch-passport__title batch-passport__title--right">
          {titleRight}
        </p>
      </header>

      <div className="batch-passport__body">
        <div className="batch-passport__photo">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={photoAlt} />
          ) : (
            <div className="batch-passport__photo-empty">—</div>
          )}
        </div>

        <dl className="batch-passport__fields">
          {fields.map((field) => (
            <div key={`${field.label}-${field.value}`} className="batch-passport__row">
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <footer className="batch-passport__footer">
        <span className="batch-passport__mrz" aria-hidden>
          {"|||||"}
        </span>
        <span className="batch-passport__id">{idNumber}</span>
      </footer>
    </article>
  );
}

/** Build passport rows from batch product data + characteristics */
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
  const maxExtra = opts.maxExtra ?? 4;
  for (const c of opts.characteristics.slice(0, maxExtra)) {
    fields.push({ label: c.key.toUpperCase(), value: c.value });
  }
  return fields;
}
