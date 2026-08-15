"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { formatDateRu } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
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
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    async function load() {
      const session = await getSession();
      const role = session?.user?.role;
      setCanWrite(role === "ADMIN" || role === "SUPER_ADMIN");

      const productRes = await fetch(`/api/products/${id}`);
      if (!productRes.ok) {
        setError("Товар не найден");
        return;
      }
      const data = await productRes.json();
      setProduct(data);
      setName(data.name);
      setSku(data.sku);
      setDescription(data.description || "");
    }
    load();
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sku, description }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Ошибка сохранения");
      return;
    }
    setProduct((prev) => (prev ? { ...prev, ...data } : prev));
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Удалить товар и все его партии?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ошибка удаления");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  if (!product && !error) {
    return <p className="text-[var(--muted)]">Загрузка…</p>;
  }
  if (!product) {
    return <p className="text-[var(--danger)]">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-[var(--accent)] hover:underline">
          ← К списку товаров
        </Link>
        <h1
          className="admin-page-title mt-2"
        >
          {product.name}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-5">
        <div className="field">
          <label htmlFor="name">Название</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={!canWrite}
          />
        </div>
        <div className="field">
          <label htmlFor="sku">Артикул</label>
          <input
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            disabled={!canWrite}
          />
        </div>
        <div className="field">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canWrite}
          />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Сохранение…" : "Сохранить"}
            </button>
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              Удалить
            </button>
          </div>
        )}
      </form>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="font-semibold">Партии товара</h2>
          <Link
            href={`/admin/batches/new?productId=${product.id}`}
            className="btn btn-secondary"
          >
            Новая партия
          </Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Дата</th>
              <th>Медиа</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {product.batches.length === 0 && (
              <tr>
                <td colSpan={4} className="text-[var(--muted)]">
                  Партий нет
                </td>
              </tr>
            )}
            {product.batches.map((batch) => (
              <tr key={batch.id}>
                <td>
                  <Link
                    href={`/admin/batches/${batch.id}`}
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    {batch.batchNumber}
                  </Link>
                </td>
                <td>{formatDateRu(batch.manufacturedAt)}</td>
                <td>{batch._count.media}</td>
                <td>{batch.status === "ACTIVE" ? "Активна" : "Архив"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
