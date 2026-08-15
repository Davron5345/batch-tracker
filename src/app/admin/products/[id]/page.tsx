"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { formatDateRu } from "@/lib/utils";
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

type Category = {
  id: string;
  code: string;
  nameRu: string;
  nameUz: string;
  nameEn: string;
};

type Product = {
  id: string;
  name: string;
  nameRu: string;
  nameUz: string;
  nameEn: string;
  sku: string;
  description: string | null;
  descriptionRu: string | null;
  descriptionUz: string | null;
  descriptionEn: string | null;
  unitId: string | null;
  categoryId: string | null;
  unit: Unit | null;
  category: Category | null;
  batches: Array<{
    id: string;
    batchNumber: string;
    manufacturedAt: string;
    status: string;
    _count: { media: number };
  }>;
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useI18n();
  const [product, setProduct] = useState<Product | null>(null);
  const [sku, setSku] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [nameUz, setNameUz] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  const [descriptionUz, setDescriptionUz] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [unitId, setUnitId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    async function load() {
      const session = await getSession();
      const role = session?.user?.role;
      setCanWrite(role === "ADMIN" || role === "SUPER_ADMIN");

      const [productRes, unitsRes, categoriesRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch("/api/units?active=1"),
        fetch("/api/categories?active=1"),
      ]);
      if (!productRes.ok) {
        setError(t.common.notFound);
        return;
      }
      const data = await productRes.json();
      setProduct(data);
      setSku(data.sku);
      setNameRu(data.nameRu || data.name || "");
      setNameUz(data.nameUz || "");
      setNameEn(data.nameEn || "");
      setDescriptionRu(data.descriptionRu || data.description || "");
      setDescriptionUz(data.descriptionUz || "");
      setDescriptionEn(data.descriptionEn || "");
      setUnitId(data.unitId || "");
      setCategoryId(data.categoryId || "");
      if (unitsRes.ok) setUnits(await unitsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    }
    load();
  }, [id, t.common.notFound]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameRu,
        nameUz,
        nameEn,
        descriptionRu,
        descriptionUz,
        descriptionEn,
        unitId: unitId || null,
        categoryId: categoryId || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || t.common.error);
      return;
    }
    setProduct((prev) => (prev ? { ...prev, ...data } : prev));
    router.refresh();
  }

  async function onDelete() {
    if (!confirm(t.products.deleteConfirm)) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || t.common.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  if (!product && !error) {
    return <p className="text-[var(--muted)]">{t.common.loading}</p>;
  }
  if (!product) {
    return <p className="text-[var(--danger)]">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-[var(--accent)] hover:underline">
          ← {t.products.backToList}
        </Link>
        <h1 className="admin-page-title mt-2">
          {pickLocalizedName(product, locale)}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-4 sm:p-5">
        <div className="field">
          <label htmlFor="sku">{t.products.sku}</label>
          <input id="sku" value={sku} disabled className="opacity-80" />
          <p className="text-xs text-[var(--muted)]">{t.products.skuAuto}</p>
        </div>
        <div className="field">
          <label htmlFor="categoryId">{t.products.category}</label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!canWrite}
          >
            <option value="">{t.products.categoryNone}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {pickLocalizedName(c, locale)} · {c.code}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="unitId">{t.products.unit}</label>
          <select
            id="unitId"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            disabled={!canWrite}
          >
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
                disabled={!canWrite}
              />
            </div>
            <div className="field">
              <label htmlFor="descRu">{t.products.descRu}</label>
              <textarea
                id="descRu"
                rows={2}
                value={descriptionRu}
                onChange={(e) => setDescriptionRu(e.target.value)}
                disabled={!canWrite}
              />
            </div>
            <div className="field">
              <label htmlFor="nameUz">{t.products.nameUz}</label>
              <input
                id="nameUz"
                value={nameUz}
                onChange={(e) => setNameUz(e.target.value)}
                disabled={!canWrite}
              />
            </div>
            <div className="field">
              <label htmlFor="descUz">{t.products.descUz}</label>
              <textarea
                id="descUz"
                rows={2}
                value={descriptionUz}
                onChange={(e) => setDescriptionUz(e.target.value)}
                disabled={!canWrite}
              />
            </div>
            <div className="field">
              <label htmlFor="nameEn">{t.products.nameEn}</label>
              <input
                id="nameEn"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                disabled={!canWrite}
              />
            </div>
            <div className="field">
              <label htmlFor="descEn">{t.products.descEn}</label>
              <textarea
                id="descEn"
                rows={2}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                disabled={!canWrite}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        {canWrite && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t.common.loading : t.common.save}
            </button>
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              {t.common.delete}
            </button>
          </div>
        )}
      </form>

      <div className="card p-4 sm:p-5">
        <h2 className="mb-3 font-semibold">{t.batches.title}</h2>
        {product.batches.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t.batches.empty}</p>
        ) : (
          <ul className="space-y-2">
            {product.batches.map((batch) => (
              <li key={batch.id}>
                <Link
                  href={`/admin/batches/${batch.id}`}
                  className="font-semibold text-[var(--accent)] hover:underline"
                >
                  {batch.batchNumber}
                </Link>
                <span className="ml-2 text-sm text-[var(--muted)]">
                  {formatDateRu(batch.manufacturedAt)} · {batch._count.media} {t.batches.media}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
