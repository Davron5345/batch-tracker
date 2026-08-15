import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canWriteProducts } from "@/lib/rbac";
import { formatDateTimeRu } from "@/lib/utils";

export default async function ProductsPage() {
  const session = await auth();
  const canWrite = canWriteProducts(session!.user.role);
  const products = await prisma.product.findMany({
    include: { _count: { select: { batches: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="admin-page-title">Товары</h1>
          <p className="mt-1 text-[var(--muted)]">Карточки продукции</p>
        </div>
        {canWrite && (
          <Link href="/admin/products/new" className="btn btn-primary w-full sm:w-auto">
            Добавить товар
          </Link>
        )}
      </div>

      <div className="mobile-card-list md:hidden">
        {products.length === 0 && (
          <div className="mobile-card text-[var(--muted)]">Товаров пока нет</div>
        )}
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="mobile-card block"
          >
            <div className="card-title">{product.name}</div>
            <div className="mobile-card-meta">Артикул {product.sku}</div>
            {product.description && (
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                {product.description}
              </p>
            )}
            <div className="mobile-card-row">
              <span className="text-sm text-[var(--muted)]">
                Партий: {product._count.batches}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {formatDateTimeRu(product.updatedAt)}
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
                <th>Название</th>
                <th>Артикул</th>
                <th>Партий</th>
                <th>Обновлён</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-[var(--muted)]">
                    Товаров пока нет
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-semibold text-[var(--accent)] hover:underline"
                    >
                      {product.name}
                    </Link>
                    {product.description && (
                      <div className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">
                        {product.description}
                      </div>
                    )}
                  </td>
                  <td>{product.sku}</td>
                  <td>{product._count.batches}</td>
                  <td>{formatDateTimeRu(product.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
