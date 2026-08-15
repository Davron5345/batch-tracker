import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateRu } from "@/lib/utils";

export default async function BatchesPage() {
  const batches = await prisma.batch.findMany({
    include: {
      product: true,
      _count: { select: { media: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="admin-page-title">Партии</h1>
          <p className="mt-1 text-[var(--muted)]">Номера, даты, QR и медиа</p>
        </div>
        <Link href="/admin/batches/new" className="btn btn-primary w-full sm:w-auto">
          Новая партия
        </Link>
      </div>

      <div className="mobile-card-list md:hidden">
        {batches.length === 0 && (
          <div className="mobile-card text-[var(--muted)]">Партий пока нет</div>
        )}
        {batches.map((batch) => (
          <Link key={batch.id} href={`/admin/batches/${batch.id}`} className="mobile-card block">
            <div className="card-title">{batch.batchNumber}</div>
            <div className="mobile-card-meta">
              {batch.product.name} · {batch.product.sku}
            </div>
            <div className="mobile-card-row">
              <span className="text-sm text-[var(--muted)]">
                {formatDateRu(batch.manufacturedAt)} · медиа {batch._count.media}
              </span>
              <span className={`badge ${batch.status === "ACTIVE" ? "" : "badge-warn"}`}>
                {batch.status === "ACTIVE" ? "Активна" : "Архив"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Товар</th>
                <th>Дата изготовления</th>
                <th>Медиа</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-[var(--muted)]">
                    Партий пока нет
                  </td>
                </tr>
              )}
              {batches.map((batch) => (
                <tr key={batch.id}>
                  <td>
                    <Link
                      href={`/admin/batches/${batch.id}`}
                      className="font-semibold text-[var(--accent)] hover:underline"
                    >
                      {batch.batchNumber}
                    </Link>
                  </td>
                  <td>
                    <div>{batch.product.name}</div>
                    <div className="text-xs text-[var(--muted)]">{batch.product.sku}</div>
                  </td>
                  <td>{formatDateRu(batch.manufacturedAt)}</td>
                  <td>{batch._count.media}</td>
                  <td>
                    <span className={`badge ${batch.status === "ACTIVE" ? "" : "badge-warn"}`}>
                      {batch.status === "ACTIVE" ? "Активна" : "Архив"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
