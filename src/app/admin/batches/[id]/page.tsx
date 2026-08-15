"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { CharacteristicsEditor } from "@/components/CharacteristicsEditor";
import { BatchVideoPlayer } from "@/components/BatchVideoPlayer";
import { PhotoZoomViewer } from "@/components/PhotoZoomViewer";
import {
  parseCharacteristics,
  type Characteristic,
} from "@/lib/utils";

type MediaItem = {
  id: string;
  type: string;
  source: string;
  urlOrPath: string;
  caption: string | null;
  pipelineStatus?: string;
  pipelineError?: string | null;
  youtubeVideoId?: string | null;
  archivedAt?: string | null;
};

const PIPELINE_LABELS: Record<string, string> = {
  none: "",
  pending_youtube: "Смотрите с сервера · ждёт YouTube",
  uploading_youtube: "Смотрите с сервера · загрузка на YouTube…",
  processing_youtube: "Смотрите с сервера · YouTube обрабатывает…",
  pending_archive: "На YouTube · архивация на сервере",
  archiving: "Сжатие и архив (90 дней)…",
  archived: "На YouTube · локальный архив 90 дней",
  youtube_failed: "Ошибка YouTube",
  archive_failed: "Ошибка архива",
  youtube_skipped: "YouTube не настроен",
};

type Batch = {
  id: string;
  productId: string;
  batchNumber: string;
  manufacturedAt: string;
  status: string;
  characteristics: string;
  publicToken: string;
  product: { id: string; name: string; sku: string };
  media: MediaItem[];
};

type ProductOption = { id: string; name: string; sku: string };

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturedAt, setManufacturedAt] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [canWrite, setCanWrite] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  const reload = useCallback(async () => {
    const res = await fetch(`/api/batches/${id}`);
    if (!res.ok) {
      setError("Партия не найдена");
      return;
    }
    const data: Batch = await res.json();
    setBatch(data);
    setProductId(data.productId);
    setBatchNumber(data.batchNumber);
    setManufacturedAt(data.manufacturedAt.slice(0, 10));
    setStatus(data.status);
    setCharacteristics(parseCharacteristics(data.characteristics));
  }, [id]);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      const role = session?.user?.role;
      setCanWrite(
        role === "EDITOR" || role === "ADMIN" || role === "SUPER_ADMIN"
      );
      const [productsRes, qrRes] = await Promise.all([
        fetch("/api/products"),
        fetch(`/api/batches/${id}/qr?format=json`),
      ]);
      if (productsRes.ok) setProducts(await productsRes.json());
      if (qrRes.ok) {
        const qr = await qrRes.json();
        setPublicUrl(qr.url);
      }
      await reload();
    }
    init();
  }, [id, reload]);

  // Poll while video pipeline is in progress (QR / publicToken never changes)
  useEffect(() => {
    if (!batch) return;
    const busy = batch.media.some((m) =>
      [
        "pending_youtube",
        "uploading_youtube",
        "processing_youtube",
        "pending_archive",
        "archiving",
      ].includes(m.pipelineStatus || "")
    );
    if (!busy) return;
    const t = setInterval(() => {
      void reload();
    }, 4000);
    return () => clearInterval(t);
  }, [batch, reload]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/batches/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        batchNumber,
        manufacturedAt,
        status,
        characteristics,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Ошибка сохранения");
      return;
    }
    setBatch(data);
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Удалить партию и все медиа?")) return;
    const res = await fetch(`/api/batches/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ошибка удаления");
      return;
    }
    router.push("/admin/batches");
    router.refresh();
  }

  async function onUpload(file: File) {
    setUploadBusy(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      setUploadBusy(false);
      setError(uploadData.error || "Ошибка загрузки");
      return;
    }
    const mediaRes = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchId: id,
        type: uploadData.type,
        source: "upload",
        urlOrPath: uploadData.urlOrPath,
      }),
    });
    setUploadBusy(false);
    if (!mediaRes.ok) {
      const data = await mediaRes.json();
      setError(data.error || "Ошибка сохранения медиа");
      return;
    }
    await reload();
  }

  async function onAddYoutube(e: FormEvent) {
    e.preventDefault();
    setUploadBusy(true);
    setError("");
    const res = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchId: id,
        type: "video",
        source: "youtube",
        urlOrPath: youtubeUrl,
      }),
    });
    setUploadBusy(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ошибка YouTube");
      return;
    }
    setYoutubeUrl("");
    await reload();
  }

  async function onDeleteMedia(mediaId: string) {
    if (!confirm("Удалить медиа?")) return;
    const res = await fetch(`/api/media/${mediaId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ошибка удаления медиа");
      return;
    }
    await reload();
  }

  async function onRetryPipeline(mediaId: string) {
    setUploadBusy(true);
    setError("");
    const res = await fetch(`/api/media/${mediaId}/retry`, { method: "POST" });
    setUploadBusy(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ошибка повтора");
      return;
    }
    await reload();
  }

  if (!batch && !error) {
    return <p className="text-[var(--muted)]">Загрузка…</p>;
  }
  if (!batch) {
    return <p className="text-[var(--danger)]">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/admin/batches" className="text-sm text-[var(--accent)] hover:underline">
          ← К списку партий
        </Link>
        <h1 className="admin-page-title mt-2">
          Партия {batch.batchNumber}
        </h1>
        <p className="text-[var(--muted)]">
          {batch.product.name} · {batch.product.sku}
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={onSubmit} className="card space-y-4 p-4 sm:p-5">
          <div className="field">
            <label htmlFor="productId">Товар</label>
            <select
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={!canWrite}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="batchNumber">Номер партии</label>
            <input
              id="batchNumber"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              disabled={!canWrite}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="manufacturedAt">Дата изготовления</label>
            <input
              id="manufacturedAt"
              type="date"
              value={manufacturedAt}
              onChange={(e) => setManufacturedAt(e.target.value)}
              disabled={!canWrite}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="status">Статус</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!canWrite}
            >
              <option value="ACTIVE">Активна</option>
              <option value="ARCHIVED">Архив</option>
            </select>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-[var(--muted)]">
              Характеристики
            </div>
            <CharacteristicsEditor
              value={characteristics}
              onChange={setCharacteristics}
              readOnly={!canWrite}
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          {canWrite && (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={loading}>
                {loading ? "Сохранение…" : "Сохранить"}
              </button>
              <button type="button" className="btn btn-danger w-full sm:w-auto" onClick={onDelete}>
                Удалить
              </button>
            </div>
          )}
        </form>

        <div className="space-y-4">
          <div className="card space-y-3 p-4 sm:p-5">
            <h2 className="font-semibold">QR-код</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/batches/${batch.id}/qr`}
              alt="QR код партии"
              className="mx-auto w-40 max-w-full rounded-lg border border-[var(--border)] bg-white p-2 sm:w-48"
            />
            <p className="break-all text-xs text-[var(--muted)]">{publicUrl}</p>
            <p className="text-xs text-[var(--muted)]">
              QR всегда ведёт на эту страницу. Смена YouTube-ссылки QR не меняет.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <a
                href={`/api/batches/${batch.id}/qr?download=1`}
                className="btn btn-primary w-full sm:w-auto"
                download
              >
                Скачать PNG
              </a>
              <Link
                href={`/b/${batch.publicToken}`}
                className="btn btn-secondary w-full sm:w-auto"
                target="_blank"
              >
                Открыть страницу
              </Link>
            </div>
          </div>

          {canWrite && (
            <div className="card space-y-3 p-4 sm:p-5">
              <h2 className="font-semibold">Медиа</h2>
              <p className="text-xs text-[var(--muted)]">
                Видео сначала на сервер → в фоне на YouTube → локальная копия сжимается в архив на 90 дней.
              </p>
              <div className="field">
                <label htmlFor="file">
                  Фото или видео (до 200 МБ, сжимается на сервере)
                </label>
                <input
                  id="file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                  disabled={uploadBusy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>
              <form onSubmit={onAddYoutube} className="space-y-2">
                <div className="field">
                  <label htmlFor="youtube">Ссылка YouTube</label>
                  <input
                    id="youtube"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=…"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={uploadBusy || !youtubeUrl.trim()}
                >
                  Добавить YouTube
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <h2 className="mb-4 font-semibold">Файлы и видео</h2>
        {batch.media.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Медиа пока нет</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {batch.media.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border border-[var(--border)]">
                {item.type === "photo" ? (
                  <PhotoZoomViewer
                    src={item.urlOrPath}
                    alt={item.caption || ""}
                  />
                ) : (
                  <BatchVideoPlayer video={item} compact />
                )}
                <div className="flex items-start justify-between gap-2 p-3">
                  <div className="text-sm">
                    <span className="badge badge-muted">{item.type}</span>{" "}
                    <span className="text-[var(--muted)]">{item.source}</span>
                    {item.pipelineStatus &&
                      item.pipelineStatus !== "none" &&
                      PIPELINE_LABELS[item.pipelineStatus] && (
                        <div className="mt-1 text-xs font-medium text-[var(--accent)]">
                          {PIPELINE_LABELS[item.pipelineStatus]}
                        </div>
                      )}
                    {item.pipelineError && (
                      <div className="mt-1 text-xs text-[var(--danger)]">
                        {item.pipelineError}
                      </div>
                    )}
                    {item.caption && <div className="mt-1">{item.caption}</div>}
                  </div>
                  {canWrite && (
                    <div className="flex flex-col gap-1">
                      {(item.pipelineStatus === "youtube_failed" ||
                        item.pipelineStatus === "archive_failed" ||
                        item.pipelineStatus === "youtube_skipped" ||
                        item.pipelineStatus === "pending_youtube") && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={uploadBusy}
                          onClick={() => onRetryPipeline(item.id)}
                        >
                          Повторить
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => onDeleteMedia(item.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
