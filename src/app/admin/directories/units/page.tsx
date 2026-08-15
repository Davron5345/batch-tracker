"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { useI18n } from "@/components/I18nProvider";
import { pickLocalizedName } from "@/lib/i18n/localize";

type Unit = {
  id: string;
  code: string;
  symbol: string | null;
  nameRu: string;
  nameUz: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm = {
  code: "",
  symbol: "",
  nameRu: "",
  nameUz: "",
  nameEn: "",
  sortOrder: 0,
};

export default function UnitsPage() {
  const { t, locale } = useI18n();
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/units");
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || t.common.error);
      return;
    }
    setUnits(await res.json());
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

  function startEdit(unit: Unit) {
    setEditingId(unit.id);
    setForm({
      code: unit.code,
      symbol: unit.symbol || "",
      nameRu: unit.nameRu,
      nameUz: unit.nameUz,
      nameEn: unit.nameEn,
      sortOrder: unit.sortOrder,
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
    const url = editingId ? `/api/units/${editingId}` : "/api/units";
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
    if (!confirm(t.units.deleteConfirm)) return;
    const res = await fetch(`/api/units/${id}`, { method: "DELETE" });
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
        <h1 className="admin-page-title mt-2">{t.units.title}</h1>
        <p className="mt-1 text-[var(--muted)]">{t.units.subtitle}</p>
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      {canWrite && (
        <form onSubmit={onSubmit} className="card grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          <div className="field">
            <label htmlFor="code">{t.units.code}</label>
            <input
              id="code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
              placeholder="kg"
            />
          </div>
          <div className="field">
            <label htmlFor="symbol">{t.units.symbol}</label>
            <input
              id="symbol"
              value={form.symbol}
              onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
              placeholder="кг"
            />
          </div>
          <div className="field">
            <label htmlFor="nameRu">{t.units.nameRu}</label>
            <input
              id="nameRu"
              value={form.nameRu}
              onChange={(e) => setForm((f) => ({ ...f, nameRu: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="nameUz">{t.units.nameUz}</label>
            <input
              id="nameUz"
              value={form.nameUz}
              onChange={(e) => setForm((f) => ({ ...f, nameUz: e.target.value }))}
              required
            />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="nameEn">{t.units.nameEn}</label>
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
                  : t.units.add}
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
        {units.length === 0 && (
          <div className="mobile-card text-[var(--muted)]">{t.units.empty}</div>
        )}
        {units.map((unit) => (
          <div key={unit.id} className="mobile-card">
            <div className="font-semibold">
              {pickLocalizedName(unit, locale)}
              {unit.symbol ? ` (${unit.symbol})` : ""}
            </div>
            <div className="mobile-card-meta">
              {unit.code} · RU: {unit.nameRu} · UZ: {unit.nameUz} · EN: {unit.nameEn}
            </div>
            {canWrite && (
              <div className="mobile-card-row">
                <button type="button" className="btn btn-secondary" onClick={() => startEdit(unit)}>
                  {t.common.edit}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => onDelete(unit.id)}
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
                <th>{t.units.code}</th>
                <th>{t.units.symbol}</th>
                <th>{t.units.nameRu}</th>
                <th>{t.units.nameUz}</th>
                <th>{t.units.nameEn}</th>
                {canWrite && <th></th>}
              </tr>
            </thead>
            <tbody>
              {units.length === 0 && (
                <tr>
                  <td colSpan={canWrite ? 6 : 5} className="text-[var(--muted)]">
                    {t.units.empty}
                  </td>
                </tr>
              )}
              {units.map((unit) => (
                <tr key={unit.id}>
                  <td className="font-medium">{unit.code}</td>
                  <td>{unit.symbol || "—"}</td>
                  <td>{unit.nameRu}</td>
                  <td>{unit.nameUz}</td>
                  <td>{unit.nameEn}</td>
                  {canWrite && (
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => startEdit(unit)}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => onDelete(unit.id)}
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
