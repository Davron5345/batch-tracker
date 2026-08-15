import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md p-8 text-center">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "Literata, Georgia, serif" }}
        >
          Партия не найдена
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          QR-код недействителен или партия снята с публикации.
        </p>
        <Link href="/scan" className="btn btn-primary mt-6 inline-flex">
          Открыть сканер
        </Link>
      </div>
    </main>
  );
}
