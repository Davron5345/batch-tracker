import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, #d8f3e7 0%, transparent 40%), radial-gradient(circle at 85% 10%, #dbe7f5 0%, transparent 35%), linear-gradient(160deg, #f7fafc 0%, #eef3f7 100%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Batch Product Tracker
        </p>
        <h1
          className="mt-4 max-w-2xl text-5xl leading-tight font-semibold text-[var(--foreground)] sm:text-6xl"
          style={{ fontFamily: "Literata, Georgia, serif" }}
        >
          Партии
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[var(--muted)]">
          Учёт товаров по партиям, медиаматериалы и QR-коды для потребителей.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="btn btn-primary">
            Войти в админку
          </Link>
          <Link href="/scan" className="btn btn-secondary">
            Сканер QR
          </Link>
        </div>
      </div>
    </main>
  );
}
