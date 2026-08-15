"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function extractToken(text: string): string | null {
  const trimmed = text.trim();
  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/b\/([^/]+)/);
    if (match?.[1]) return match[1];
  } catch {
    // plain token
  }
  if (/^[A-Za-z0-9_-]{8,}$/.test(trimmed)) return trimmed;
  return null;
}

export default function ScanPage() {
  const router = useRouter();
  const regionId = "qr-reader";
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let scanner: { stop: () => Promise<void> } | null = null;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const html5 = new Html5Qrcode(regionId);
        scanner = html5;
        await html5.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decoded) => {
            const token = extractToken(decoded);
            if (token) {
              html5
                .stop()
                .catch(() => undefined)
                .finally(() => router.push(`/b/${token}`));
            }
          },
          () => undefined
        );
        setReady(true);
      } catch {
        setError(
          "Не удалось открыть камеру. Разрешите доступ или откройте страницу по HTTPS / localhost."
        );
      }
    }

    start();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    return () => {
      scanner?.stop().catch(() => undefined);
    };
  }, [router]);

  return (
    <main
      className="min-h-screen px-4 py-8"
      style={{
        background:
          "radial-gradient(circle at 80% 0%, #dbe7f5 0%, transparent 40%), #f4f6f8",
      }}
    >
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h1
            className="text-3xl font-semibold"
            style={{ fontFamily: "Literata, Georgia, serif" }}
          >
            Сканер QR
          </h1>
          <Link href="/" className="text-sm text-[var(--accent)]">
            На главную
          </Link>
        </div>
        <p className="text-[var(--muted)]">
          Наведите камеру на QR-код партии. Можно установить как приложение (PWA).
        </p>

        <div className="card overflow-hidden p-3">
          <div id={regionId} className="overflow-hidden rounded-lg" />
          {!ready && !error && (
            <p className="p-4 text-center text-sm text-[var(--muted)]">
              Запуск камеры…
            </p>
          )}
          {error && <p className="p-4 text-sm text-[var(--danger)]">{error}</p>}
        </div>
      </div>
    </main>
  );
}
