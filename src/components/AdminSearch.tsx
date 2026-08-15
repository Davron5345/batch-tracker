"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminSearch({
  initialQ,
  initialDateFrom,
  initialDateTo,
}: {
  initialQ: string;
  initialDateFrom: string;
  initialDateTo: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const qs = params.toString();
    router.push(qs ? `/admin?${qs}` : "/admin");
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-3 p-4 md:grid-cols-4">
      <div className="field md:col-span-2">
        <label htmlFor="q">Поиск</label>
        <input
          id="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Номер партии, название, артикул…"
          enterKeyHint="search"
        />
      </div>
      <div className="field">
        <label htmlFor="dateFrom">Дата от</label>
        <input
          id="dateFrom"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="dateTo">Дата до</label>
        <input
          id="dateTo"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>
      <div className="md:col-span-4">
        <button type="submit" className="btn btn-primary w-full sm:w-auto">
          Найти
        </button>
      </div>
    </form>
  );
}
