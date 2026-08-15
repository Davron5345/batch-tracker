import { prisma } from "@/lib/prisma";
import { MediaPipelineStatus } from "@/lib/constants";
import { isYoutubeConfigured, uploadVideoToYoutube } from "@/lib/youtube";
import {
  compressAndArchiveVideo,
  deleteArchiveFile,
  publicUploadToAbs,
  retentionCutoff,
} from "@/lib/archive";
import { writeAuditLog } from "@/lib/audit";

const inFlight = new Set<string>();

export function scheduleMediaPipeline(mediaId: string) {
  void processMediaPipeline(mediaId).catch((err) => {
    console.error("[media-pipeline]", mediaId, err);
  });
}

export async function processPendingMedia(limit = 5) {
  const pending = await prisma.media.findMany({
    where: {
      type: "video",
      pipelineStatus: {
        in: [
          MediaPipelineStatus.pending_youtube,
          MediaPipelineStatus.pending_archive,
          MediaPipelineStatus.youtube_failed,
          MediaPipelineStatus.archive_failed,
        ],
      },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const results = [];
  for (const m of pending) {
    results.push(await processMediaPipeline(m.id));
  }
  return results;
}

export async function processMediaPipeline(mediaId: string) {
  if (inFlight.has(mediaId)) {
    return { id: mediaId, skipped: true, reason: "in_flight" };
  }
  inFlight.add(mediaId);
  try {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        batch: { include: { product: true } },
      },
    });
    if (!media || media.type !== "video") {
      return { id: mediaId, skipped: true };
    }

    const status = media.pipelineStatus;

    // Upload to YouTube first; leave archive for a later job tick so clients
    // can keep playing /uploads until the UI switches to the YouTube embed.
    if (
      status === MediaPipelineStatus.pending_youtube ||
      status === MediaPipelineStatus.youtube_failed
    ) {
      await uploadStep(media.id);
      return { id: mediaId, ok: true, step: "youtube" };
    }

    if (
      status === MediaPipelineStatus.pending_archive ||
      status === MediaPipelineStatus.archive_failed
    ) {
      await archiveStep(mediaId);
      return { id: mediaId, ok: true, step: "archive" };
    }

    return { id: mediaId, ok: true, step: "noop" };
  } finally {
    inFlight.delete(mediaId);
  }
}

async function uploadStep(mediaId: string) {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: { batch: { include: { product: true } } },
  });
  if (!media) return;

  if (!isYoutubeConfigured()) {
    await prisma.media.update({
      where: { id: mediaId },
      data: {
        pipelineStatus: MediaPipelineStatus.youtube_skipped,
        pipelineError:
          "YouTube API не настроен (YOUTUBE_CLIENT_ID / SECRET / REFRESH_TOKEN). Видео остаётся на сервере.",
      },
    });
    return;
  }

  const localPath = media.localPath || media.urlOrPath;
  if (!localPath?.startsWith("/uploads/")) {
    await prisma.media.update({
      where: { id: mediaId },
      data: {
        pipelineStatus: MediaPipelineStatus.youtube_failed,
        pipelineError: "Нет локального файла для загрузки на YouTube",
      },
    });
    return;
  }

  await prisma.media.update({
    where: { id: mediaId },
    data: {
      pipelineStatus: MediaPipelineStatus.uploading_youtube,
      pipelineError: null,
    },
  });

  try {
    const title = `${media.batch.product.name} · партия ${media.batch.batchNumber}`;
    const description = [
      `Партия: ${media.batch.batchNumber}`,
      `Товар: ${media.batch.product.name} (${media.batch.product.sku})`,
      media.caption ? `Подпись: ${media.caption}` : "",
      `Страница партии (QR): /b/${media.batch.publicToken}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { videoId, watchUrl } = await uploadVideoToYoutube({
      filePath: publicUploadToAbs(localPath),
      title,
      description,
    });

    await prisma.media.update({
      where: { id: mediaId },
      data: {
        source: "youtube",
        urlOrPath: watchUrl,
        youtubeVideoId: videoId,
        localPath,
        pipelineStatus: MediaPipelineStatus.pending_archive,
        pipelineError: null,
      },
    });

    await writeAuditLog({
      batchId: media.batchId,
      entity: "Media",
      entityId: mediaId,
      action: "YOUTUBE_UPLOAD",
      diff: { videoId, watchUrl, publicTokenUnchanged: media.batch.publicToken },
    });

    // Archive after a short delay so open documents can switch to YouTube first
    setTimeout(() => {
      void processMediaPipeline(mediaId).catch((err) => {
        console.error("[media-pipeline:archive]", mediaId, err);
      });
    }, 20_000);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.media.update({
      where: { id: mediaId },
      data: {
        pipelineStatus: MediaPipelineStatus.youtube_failed,
        pipelineError: message.slice(0, 1000),
      },
    });
  }
}

async function archiveStep(mediaId: string) {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) return;

  const localPath = media.localPath;
  if (!localPath?.startsWith("/uploads/")) {
    await prisma.media.update({
      where: { id: mediaId },
      data: {
        pipelineStatus: MediaPipelineStatus.archived,
        archivedAt: new Date(),
        pipelineError: null,
      },
    });
    return;
  }

  await prisma.media.update({
    where: { id: mediaId },
    data: {
      pipelineStatus: MediaPipelineStatus.archiving,
      pipelineError: null,
    },
  });

  try {
    const { archivePath, compressed } = await compressAndArchiveVideo({
      mediaId,
      localPublicPath: localPath,
    });

    await prisma.media.update({
      where: { id: mediaId },
      data: {
        localPath: null,
        archivePath,
        archivedAt: new Date(),
        pipelineStatus: MediaPipelineStatus.archived,
        pipelineError: compressed
          ? null
          : "ffmpeg не найден: файл сохранён в архив без сжатия",
      },
    });

    await writeAuditLog({
      batchId: media.batchId,
      entity: "Media",
      entityId: mediaId,
      action: "ARCHIVE",
      diff: { archivePath, compressed },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.media.update({
      where: { id: mediaId },
      data: {
        pipelineStatus: MediaPipelineStatus.archive_failed,
        pipelineError: message.slice(0, 1000),
      },
    });
  }
}

export async function cleanupExpiredArchives() {
  const cutoff = retentionCutoff();
  const expired = await prisma.media.findMany({
    where: {
      archivedAt: { lt: cutoff },
      archivePath: { not: null },
    },
  });

  let deleted = 0;
  for (const m of expired) {
    await deleteArchiveFile(m.archivePath);
    await prisma.media.update({
      where: { id: m.id },
      data: { archivePath: null },
    });
    await writeAuditLog({
      batchId: m.batchId,
      entity: "Media",
      entityId: m.id,
      action: "ARCHIVE_PURGE",
      diff: { archivedAt: m.archivedAt, cutoff },
    });
    deleted += 1;
  }

  return { deleted, cutoff };
}
