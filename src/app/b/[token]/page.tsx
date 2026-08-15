import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatDateRu,
  parseCharacteristics,
  youtubeEmbedUrl,
} from "@/lib/utils";

type Params = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Params) {
  const { token } = await params;
  const batch = await prisma.batch.findUnique({
    where: { publicToken: token },
    include: { product: true },
  });
  if (!batch) return { title: "Партия не найдена" };
  return {
    title: `${batch.product.name} · партия ${batch.batchNumber}`,
    description: batch.product.description || undefined,
  };
}

export default async function PublicBatchPage({ params }: Params) {
  const { token } = await params;
  const batch = await prisma.batch.findUnique({
    where: { publicToken: token },
    include: {
      product: true,
      media: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!batch || batch.status === "ARCHIVED") {
    notFound();
  }

  const characteristics = parseCharacteristics(batch.characteristics);
  const photos = batch.media.filter((m) => m.type === "photo");
  const videos = batch.media.filter((m) => m.type === "video");

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at 10% 0%, #d8f3e7 0%, transparent 35%), linear-gradient(180deg, #f7fafc 0%, #eef3f7 100%)",
      }}
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/scan" className="text-sm font-semibold text-[var(--accent)]">
            Сканер QR
          </Link>
          <span className="badge">Партия</span>
        </div>

        <header className="card p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            {batch.product.sku}
          </p>
          <h1
            className="mt-2 text-4xl font-semibold leading-tight"
            style={{ fontFamily: "Literata, Georgia, serif" }}
          >
            {batch.product.name}
          </h1>
          {batch.product.description && (
            <p className="mt-3 text-[var(--muted)]">{batch.product.description}</p>
          )}
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f8fafc] px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Номер партии
              </dt>
              <dd className="mt-1 text-lg font-semibold">{batch.batchNumber}</dd>
            </div>
            <div className="rounded-xl bg-[#f8fafc] px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Дата изготовления
              </dt>
              <dd className="mt-1 text-lg font-semibold">
                {formatDateRu(batch.manufacturedAt)}
              </dd>
            </div>
          </dl>
        </header>

        {characteristics.length > 0 && (
          <section className="card mt-4 p-6">
            <h2 className="text-lg font-semibold">Характеристики</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {characteristics.map((item, i) => (
                <div key={`${item.key}-${i}`} className="rounded-xl bg-[#f8fafc] px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {item.key}
                  </dt>
                  <dd className="mt-1 font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {photos.length > 0 && (
          <section className="card mt-4 p-6">
            <h2 className="text-lg font-semibold">Фото</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {photos.map((photo) => (
                <figure key={photo.id} className="overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.urlOrPath}
                    alt={photo.caption || batch.product.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  {photo.caption && (
                    <figcaption className="mt-2 text-sm text-[var(--muted)]">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section className="card mt-4 p-6">
            <h2 className="text-lg font-semibold">Видео</h2>
            <div className="mt-4 space-y-4">
              {videos.map((video) => (
                <div key={video.id} className="overflow-hidden rounded-xl bg-black">
                  {video.source === "youtube" ? (
                    <iframe
                      src={youtubeEmbedUrl(video.urlOrPath) || undefined}
                      className="aspect-video w-full"
                      title={video.caption || "YouTube"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={video.urlOrPath}
                      controls
                      className="aspect-video w-full"
                      playsInline
                    />
                  )}
                  {video.caption && (
                    <p className="bg-white px-3 py-2 text-sm text-[var(--muted)]">
                      {video.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
