import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatDateLocalized,
  parseCharacteristics,
} from "@/lib/utils";
import {
  getServerDictionary,
  pickLocalizedDescription,
  pickLocalizedName,
} from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PublicVideos } from "@/components/PublicVideos";

type Params = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Params) {
  const { token } = await params;
  const { locale, t } = await getServerDictionary();
  const batch = await prisma.batch.findUnique({
    where: { publicToken: token },
    include: { product: true },
  });
  if (!batch) return { title: t.public.notFound };
  const name = pickLocalizedName(batch.product, locale);
  return {
    title: `${name} · ${t.public.batch} ${batch.batchNumber}`,
    description: pickLocalizedDescription(batch.product, locale) || undefined,
  };
}

export default async function PublicBatchPage({ params }: Params) {
  const { token } = await params;
  const { locale, t } = await getServerDictionary();
  const batch = await prisma.batch.findUnique({
    where: { publicToken: token },
    include: {
      product: { include: { unit: true, category: true } },
      media: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!batch || batch.status === "ARCHIVED") {
    notFound();
  }

  const productName = pickLocalizedName(batch.product, locale);
  const productDescription = pickLocalizedDescription(batch.product, locale);
  const unitLabel = batch.product.unit
    ? pickLocalizedName(batch.product.unit, locale)
    : "";
  const categoryLabel = batch.product.category
    ? pickLocalizedName(batch.product.category, locale)
    : "";
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/scan" className="text-sm font-semibold text-[var(--accent)]">
            {t.public.scanner}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <span className="badge">{t.public.batch}</span>
          </div>
        </div>

        <header className="card p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            {batch.product.sku}
          </p>
          <h1
            className="mt-2 text-4xl font-semibold leading-tight"
            style={{ fontFamily: "Literata, Georgia, serif" }}
          >
            {productName}
          </h1>
          {productDescription && (
            <p className="mt-3 text-[var(--muted)]">{productDescription}</p>
          )}
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f8fafc] px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {t.public.batchNumber}
              </dt>
              <dd className="mt-1 text-lg font-semibold">{batch.batchNumber}</dd>
            </div>
            <div className="rounded-xl bg-[#f8fafc] px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {t.public.manufacturedAt}
              </dt>
              <dd className="mt-1 text-lg font-semibold">
                {formatDateLocalized(batch.manufacturedAt, locale)}
              </dd>
            </div>
            {categoryLabel && (
              <div className="rounded-xl bg-[#f8fafc] px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {t.public.category}
                </dt>
                <dd className="mt-1 text-lg font-semibold">{categoryLabel}</dd>
              </div>
            )}
            {unitLabel && (
              <div className="rounded-xl bg-[#f8fafc] px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {t.public.unit}
                </dt>
                <dd className="mt-1 text-lg font-semibold">
                  {unitLabel}
                  {batch.product.unit?.symbol
                    ? ` (${batch.product.unit.symbol})`
                    : ""}
                </dd>
              </div>
            )}
          </dl>
        </header>

        {characteristics.length > 0 && (
          <section className="card mt-4 p-6">
            <h2 className="text-lg font-semibold">{t.public.characteristics}</h2>
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
            <h2 className="text-lg font-semibold">{t.public.photos}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {photos.map((photo) => (
                <figure key={photo.id} className="overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.urlOrPath}
                    alt={photo.caption || productName}
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
          <PublicVideos
            token={token}
            heading={t.public.videos}
            uploadingLabel={t.public.videoUploading}
            failedLabel={t.public.videoFailed}
            initialVideos={videos.map((video) => ({
              id: video.id,
              source: video.source,
              urlOrPath: video.urlOrPath,
              caption: video.caption,
              pipelineStatus: video.pipelineStatus,
              youtubeVideoId: video.youtubeVideoId,
              localPath: video.localPath,
            }))}
          />
        )}
      </div>
    </main>
  );
}
