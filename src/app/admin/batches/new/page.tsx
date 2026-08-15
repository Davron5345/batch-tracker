"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CharacteristicsEditor } from "@/components/CharacteristicsEditor";
import type { Characteristic } from "@/lib/utils";

type ProductOption = { id: string; name: string; sku: string };

function NewBatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState(searchParams.get("productId") || "");
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturedAt, setManufacturedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState("ACTIVE");
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([
    { key: "", value: "" },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          if (!productId && data[0]) setProductId(data[0].id);
        }
      });
  }, [productId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        batchNumber,
        manufacturedAt,
        status,
        characteristics,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Ошибка сохранения");
      return;
    }
    router.push(`/admin/batches/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/batches" className="text-sm text-[var(--accent)] hover:underline">
          ← К списку партий
        </Link>
        <h1
          className="admin-page-title mt-2"
        >
          Новая партия
        </h1>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-4 sm:p-5">
        <div className="field">
          <label htmlFor="productId">Товар</label>
          <select
            id="productId"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          >
            <option value="">Выберите товар</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="batchNumber">Номер партии</label>
          <input
            id="batchNumber"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="manufacturedAt">Дата изготовления</label>
          <input
            id="manufacturedAt"
            type="date"
            value={manufacturedAt}
            onChange={(e) => setManufacturedAt(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="status">Статус</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ACTIVE">Активна</option>
            <option value="ARCHIVED">Архив</option>
          </select>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-[var(--muted)]">Характеристики</div>
          <CharacteristicsEditor value={characteristics} onChange={setCharacteristics} />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button
          type="submit"
          className="btn btn-primary w-full sm:w-auto"
          disabled={loading || !productId}
        >
          {loading ? "Создание…" : "Создать партию"}
        </button>
      </form>
    </div>
  );
}

export default function NewBatchPage() {
  return (
    <Suspense fallback={<p className="text-[var(--muted)]">Загрузка…</p>}>
      <NewBatchForm />
    </Suspense>
  );
}
