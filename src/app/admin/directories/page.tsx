import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n";

export default async function DirectoriesPage() {
  const { t } = await getServerDictionary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title">{t.directories.title}</h1>
        <p className="mt-1 text-[var(--muted)]">{t.directories.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/directories/units"
          className="card block p-5 transition hover:border-[var(--accent)]"
        >
          <div className="text-lg font-semibold">{t.directories.unitsTitle}</div>
          <p className="mt-2 text-sm text-[var(--muted)]">{t.directories.unitsDesc}</p>
          <span className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]">
            {t.directories.open} →
          </span>
        </Link>
        <Link
          href="/admin/directories/categories"
          className="card block p-5 transition hover:border-[var(--accent)]"
        >
          <div className="text-lg font-semibold">{t.directories.categoriesTitle}</div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {t.directories.categoriesDesc}
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]">
            {t.directories.open} →
          </span>
        </Link>
      </div>
    </div>
  );
}
