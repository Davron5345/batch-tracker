"use client";

import { useEffect, useState } from "react";
import type { Characteristic } from "@/lib/utils";

export function CharacteristicsEditor({
  value,
  onChange,
  readOnly = false,
}: {
  value: Characteristic[];
  onChange?: (next: Characteristic[]) => void;
  readOnly?: boolean;
}) {
  const [items, setItems] = useState<Characteristic[]>(
    value.length ? value : [{ key: "", value: "" }]
  );

  useEffect(() => {
    setItems(value.length ? value : [{ key: "", value: "" }]);
  }, [value]);

  function update(next: Characteristic[]) {
    setItems(next);
    onChange?.(next);
  }

  if (readOnly) {
    if (!value.length) {
      return <p className="text-sm text-[var(--muted)]">Характеристики не указаны</p>;
    }
    return (
      <dl className="grid gap-2 sm:grid-cols-2">
        {value.map((item, i) => (
          <div key={`${item.key}-${i}`} className="rounded-lg bg-[#f8fafc] px-3 py-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {item.key}
            </dt>
            <dd className="mt-0.5 font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            placeholder="Ключ (например, Материал)"
            value={item.key}
            onChange={(e) => {
              const next = [...items];
              next[index] = { ...next[index], key: e.target.value };
              update(next);
            }}
            className="min-h-11 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-base"
          />
          <input
            placeholder="Значение"
            value={item.value}
            onChange={(e) => {
              const next = [...items];
              next[index] = { ...next[index], value: e.target.value };
              update(next);
            }}
            className="min-h-11 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-base"
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => update(items.filter((_, i) => i !== index))}
            disabled={items.length === 1}
          >
            Удалить
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => update([...items, { key: "", value: "" }])}
      >
        + Характеристика
      </button>
    </div>
  );
}
