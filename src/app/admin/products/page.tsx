import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canWriteProducts } from "@/lib/rbac";
import { formatDateTimeRu } from "@/lib/utils";
import { getServerDictionary, pickLocalizedName } from "@/lib/i18n";

export default async function ProductsPage() {
  const session = await auth();
  const canWrite = canWriteProducts(session!.user.role);
  const { t, locale } = await getServerDictionary();
  const products = await prisma.product.findMany({
    include: { _count: { select: { batches: true } }, unit: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="admin-page-title">{t.products.title}</h1>
          <p className="mt-1 text-[var(--muted)]">{t.products.subtitle}</p>
        </div>
        {canWrite && (
          <Link href="/admin/products/new" className="btn btn-primary w-full sm:w-auto">
            {t.products.add}
          </Link>
        )}
      </div>

      <div className="mobile-card-list md:hidden">
        {products.length === 0 && (
          <div className="mobile-card text-[var(--muted)]">{t.products.empty}</div>
        )}
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="mobile-card block"
          >
            <div className="card-title">{pickLocalizedName(product, locale)}</div>
            <div className="mobile-card-meta">
              {t.products.sku} {product.sku}
              {product.unit
                ? ` · ${pickLocalizedName(product.unit, locale)}`
                : ""}
            </div>
            <div className="mobile-card-row">
              <span className="text-sm text-[var(--muted)]">
                {t.products.batchesCount}: {product._count.batches}
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
                <th>{t.products.nameRu}</th>
                <th>{t.products.sku}</th>
                <th>{t.products.unit}</th>
                <th>{t.products.batchesCount}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-[var(--muted)]">
                    {t.products.empty}
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
                      {pickLocalizedName(product, locale)}
                    </Link>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      RU: {product.nameRu || product.name}
                      {product.nameUz ? ` · UZ: ${product.nameUz}` : ""}
                      {product.nameEn ? ` · EN: ${product.nameEn}` : ""}
                    </div>
                  </td>
                  <td>{product.sku}</td>
                  <td>
                    {product.unit
                      ? pickLocalizedName(product.unit, locale)
                      : "—"}
                  </td>
                  <td>{product._count.batches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
