"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { useI18n } from "@/components/I18nProvider";
import { pickLocalizedName } from "@/lib/i18n/localize";

type Category = {
  id: string;
  code: string;
  nameRu: string;
  nameUz: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm = {
  code: "",
  nameRu: "",
  nameUz: "",
  nameEn: "",
  sortOrder: 0,
};

export default function CategoriesPage() {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/categories");
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || t.common.error);
      return;
    }
    setItems(await res.json());
  }

  useEffect(() => {
    async function init() {
      const session = await getSession();
      const role = session?.user?.role;
      setCanWrite(role === "ADMIN" || role === "SUPER_ADMIN");
      await load();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(item: Category) {
    setEditingId(item.id);
    setForm({
      code: item.code,
      nameRu: item.nameRu,
      nameUz: item.nameUz,
      nameEn: item.nameEn,
      sortOrder: item.sortOrder,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || t.common.error);
      return;
    }
    resetForm();
    await load();
  }

  async function onDelete(id: string) {
    if (!confirm(t.categories.deleteConfirm)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || t.common.error);
      return;
    }
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/directories" className="text-sm text-[var(--accent)] hover:underline">
          ← {t.nav.directories}
        </Link>
        <h1 className="admin-page-title mt-2">{t.categories.title}</h1>
        <p className="mt-1 text-[var(--muted)]">{t.categories.subtitle}</p>
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      {canWrite && (
        <form onSubmit={onSubmit} className="card grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          <div className="field">
            <label htmlFor="code">{t.categories.code}</label>
            <input
              id="code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
              placeholder="food"
            />
          </div>
          <div className="field">
            <label htmlFor="nameRu">{t.categories.nameRu}</label>
            <input
              id="nameRu"
              value={form.nameRu}
              onChange={(e) => setForm((f) => ({ ...f, nameRu: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="nameUz">{t.categories.nameUz}</label>
            <input
              id="nameUz"
              value={form.nameUz}
              onChange={(e) => setForm((f) => ({ ...f, nameUz: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="nameEn">{t.categories.nameEn}</label>
            <input
              id="nameEn"
              value={form.nameEn}
              onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? t.common.loading
                : editingId
                  ? t.common.save
                  : t.categories.add}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                {t.common.cancel}
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mobile-card-list md:hidden">
        {items.length === 0 && (
          <div className="mobile-card text-[var(--muted)]">{t.categories.empty}</div>
        )}
        {items.map((item) => (
          <div key={item.id} className="mobile-card">
            <div className="font-semibold">{pickLocalizedName(item, locale)}</div>
            <div className="mobile-card-meta">
              {item.code} · RU: {item.nameRu} · UZ: {item.nameUz} · EN: {item.nameEn}
            </div>
            {canWrite && (
              <div className="mobile-card-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => startEdit(item)}
                >
                  {t.common.edit}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => onDelete(item.id)}
                >
                  {t.common.delete}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{t.categories.code}</th>
                <th>{t.categories.nameRu}</th>
                <th>{t.categories.nameUz}</th>
                <th>{t.categories.nameEn}</th>
                {canWrite && <th></th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={canWrite ? 5 : 4} className="text-[var(--muted)]">
                    {t.categories.empty}
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.code}</td>
                  <td>{item.nameRu}</td>
                  <td>{item.nameUz}</td>
                  <td>{item.nameEn}</td>
                  {canWrite && (
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => startEdit(item)}
                        >
                          {t.common.edit}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => onDelete(item.id)}
                        >
                          {t.common.delete}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
