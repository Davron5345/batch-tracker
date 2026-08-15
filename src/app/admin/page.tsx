import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateRu } from "@/lib/utils";
import { AdminSearch } from "@/components/AdminSearch";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim();
  const dateFrom = params.dateFrom;
  const dateTo = params.dateTo;

  const [productCount, batchCount, mediaCount, recentBatches] = await Promise.all([
    prisma.product.count(),
    prisma.batch.count(),
    prisma.media.count(),
    prisma.batch.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { batchNumber: { contains: q } },
                  { product: { name: { contains: q } } },
                  { product: { sku: { contains: q } } },
                ],
              }
            : {},
          dateFrom || dateTo
            ? {
                manufacturedAt: {
                  ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                  ...(dateTo
                    ? {
                        lte: (() => {
                          const end = new Date(dateTo);
                          end.setHours(23, 59, 59, 999);
                          return end;
                        })(),
                      }
                    : {}),
                },
              }
            : {},
        ],
      },
      include: { product: true, _count: { select: { media: true } } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title">Дашборд</h1>
        <p className="mt-1 text-[var(--muted)]">Поиск и обзор партий</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="card p-3 sm:p-4">
          <div className="text-xs text-[var(--muted)] sm:text-sm">Товары</div>
          <div className="mt-1 text-2xl font-semibold sm:text-3xl">{productCount}</div>
        </div>
        <div className="card p-3 sm:p-4">
          <div className="text-xs text-[var(--muted)] sm:text-sm">Партии</div>
          <div className="mt-1 text-2xl font-semibold sm:text-3xl">{batchCount}</div>
        </div>
        <div className="card p-3 sm:p-4">
          <div className="text-xs text-[var(--muted)] sm:text-sm">Медиа</div>
          <div className="mt-1 text-2xl font-semibold sm:text-3xl">{mediaCount}</div>
        </div>
      </div>

      <AdminSearch
        initialQ={q || ""}
        initialDateFrom={dateFrom || ""}
        initialDateTo={dateTo || ""}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Партии</h2>
          <Link href="/admin/batches/new" className="btn btn-primary shrink-0">
            Новая партия
          </Link>
        </div>

        {/* Mobile / tablet cards */}
        <div className="mobile-card-list md:hidden">
          {recentBatches.length === 0 && (
            <div className="mobile-card text-[var(--muted)]">Ничего не найдено</div>
          )}
          {recentBatches.map((batch) => (
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

        {/* Desktop table */}
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
                {recentBatches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-[var(--muted)]">
                      Ничего не найдено
                    </td>
                  </tr>
                )}
                {recentBatches.map((batch) => (
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
                      <span
                        className={`badge ${
                          batch.status === "ACTIVE" ? "" : "badge-warn"
                        }`}
                      >
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
    </div>
  );
}
