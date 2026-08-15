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
import {
  BatchPassportCard,
  buildPassportFields,
} from "@/components/BatchPassportCard";

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

function formatPassportDate(date: Date, locale: "ru" | "uz" | "en") {
  const d = date;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  if (locale === "en") return `${yyyy}-${mm}-${dd}`;
  return `${dd}.${mm}.${yyyy}`;
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
  const unitValue = batch.product.unit
    ? `${unitLabel}${
        batch.product.unit.symbol ? ` (${batch.product.unit.symbol})` : ""
      }`
    : "";
  const categoryLabel = batch.product.category
    ? pickLocalizedName(batch.product.category, locale)
    : "";
  const characteristics = parseCharacteristics(batch.characteristics);
  const photos = batch.media.filter((m) => m.type === "photo");
  const videos = batch.media.filter((m) => m.type === "video");
  const mainPhoto = photos[0] || null;
  const extraPhotos = photos.slice(1);

  const passportFields = buildPassportFields({
    productLabel: t.public.passportProduct,
    productName,
    skuLabel: t.public.passportSku,
    sku: batch.product.sku,
    batchLabel: t.public.passportBatch,
    batchNumber: batch.batchNumber,
    dateLabel: t.public.passportDate,
    manufacturedAt: formatPassportDate(batch.manufacturedAt, locale),
    categoryLabel: t.public.category,
    category: categoryLabel || undefined,
    unitLabel: t.public.unit,
    unit: unitValue || undefined,
    characteristics,
  });

  const idNumber = `${batch.product.sku.replace(/\s+/g, "")}-${batch.batchNumber}`
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toUpperCase()
    .slice(0, 24);

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at 10% 0%, #d4e8f2 0%, transparent 40%), linear-gradient(180deg, #eef3f7 0%, #e4ecf2 100%)",
      }}
    >
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/scan" className="text-sm font-semibold text-[var(--accent)]">
            {t.public.scanner}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <span className="badge">{t.public.batch}</span>
          </div>
        </div>

        <BatchPassportCard
          photoUrl={mainPhoto?.urlOrPath}
          photoAlt={mainPhoto?.caption || productName}
          titleLeft={t.public.passportTitleLeft}
          titleRight={t.public.passportTitleRight}
          fields={passportFields}
          idNumber={idNumber}
          watermark={t.public.passportWatermark}
        />

        {productDescription && (
          <p className="mt-4 px-1 text-sm text-[var(--muted)]">{productDescription}</p>
        )}

        {extraPhotos.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              {t.public.extraPhotos}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {extraPhotos.map((photo) => (
                <figure
                  key={photo.id}
                  className="overflow-hidden rounded-xl border border-[var(--border)] bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.urlOrPath}
                    alt={photo.caption || productName}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  {photo.caption && (
                    <figcaption className="px-3 py-2 text-sm text-[var(--muted)]">
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

        {!mainPhoto && characteristics.length === 0 && !productDescription && (
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            {formatDateLocalized(batch.manufacturedAt, locale)}
          </p>
        )}
      </div>
    </main>
  );
}
