"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import { pickLocalizedName } from "@/lib/i18n/localize";

type Unit = {
  id: string;
  code: string;
  symbol: string | null;
  nameRu: string;
  nameUz: string;
  nameEn: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [sku, setSku] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [nameUz, setNameUz] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  const [descriptionUz, setDescriptionUz] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [unitId, setUnitId] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/units?active=1")
      .then((r) => (r.ok ? r.json() : []))
      .then(setUnits)
      .catch(() => setUnits([]));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku,
        nameRu,
        nameUz,
        nameEn,
        descriptionRu,
        descriptionUz,
        descriptionEn,
        unitId: unitId || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || t.common.error);
      return;
    }
    router.push(`/admin/products/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-[var(--accent)] hover:underline">
          ← {t.products.backToList}
        </Link>
        <h1 className="admin-page-title mt-2">{t.products.new}</h1>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-4 sm:p-5">
        <div className="field">
          <label htmlFor="sku">{t.products.sku}</label>
          <input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="unitId">{t.products.unit}</label>
          <select id="unitId" value={unitId} onChange={(e) => setUnitId(e.target.value)}>
            <option value="">{t.products.unitNone}</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {pickLocalizedName(u, locale)}
                {u.symbol ? ` (${u.symbol})` : ""} · {u.code}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-[var(--border)] pt-4">
          <h2 className="mb-3 font-semibold">{t.products.langSection}</h2>
          <div className="space-y-3">
            <div className="field">
              <label htmlFor="nameRu">{t.products.nameRu}</label>
              <input
                id="nameRu"
                value={nameRu}
                onChange={(e) => setNameRu(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="descRu">{t.products.descRu}</label>
              <textarea
                id="descRu"
                rows={2}
                value={descriptionRu}
                onChange={(e) => setDescriptionRu(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="nameUz">{t.products.nameUz}</label>
              <input id="nameUz" value={nameUz} onChange={(e) => setNameUz(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="descUz">{t.products.descUz}</label>
              <textarea
                id="descUz"
                rows={2}
                value={descriptionUz}
                onChange={(e) => setDescriptionUz(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="nameEn">{t.products.nameEn}</label>
              <input id="nameEn" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="descEn">{t.products.descEn}</label>
              <textarea
                id="descEn"
                rows={2}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={loading}>
          {loading ? t.common.loading : t.common.create}
        </button>
      </form>
    </div>
  );
}
