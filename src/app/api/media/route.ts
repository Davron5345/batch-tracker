import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { extractYoutubeId } from "@/lib/utils";
import { MediaPipelineStatus } from "@/lib/constants";
import { scheduleMediaPipeline } from "@/lib/media-pipeline";

export async function POST(req: NextRequest) {
  const authz = await requirePermission("media:write");
  if (authz.error) return authz.error;

  const body = await req.json();
  const batchId = String(body.batchId || "").trim();
  const type = body.type === "video" ? "video" : "photo";
  const source = body.source === "youtube" ? "youtube" : "upload";
  const urlOrPath = String(body.urlOrPath || "").trim();
  const caption = body.caption ? String(body.caption).trim() : null;
  const sortOrder = Number.isFinite(Number(body.sortOrder))
    ? Number(body.sortOrder)
    : 0;

  if (!batchId || !urlOrPath) {
    return NextResponse.json(
      { error: "Партия и URL/путь обязательны" },
      { status: 400 }
    );
  }

  if (source === "youtube") {
    if (type !== "video") {
      return NextResponse.json(
        { error: "YouTube можно добавить только как видео" },
        { status: 400 }
      );
    }
    if (!extractYoutubeId(urlOrPath)) {
      return NextResponse.json(
        { error: "Некорректная ссылка YouTube" },
        { status: 400 }
      );
    }
  }

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch) {
    return NextResponse.json({ error: "Партия не найдена" }, { status: 404 });
  }

  const isLocalVideo = type === "video" && source === "upload";

  const media = await prisma.media.create({
    data: {
      batchId,
      type,
      source,
      urlOrPath,
      caption,
      sortOrder,
      localPath: isLocalVideo ? urlOrPath : null,
      pipelineStatus: isLocalVideo
        ? MediaPipelineStatus.pending_youtube
        : MediaPipelineStatus.none,
    },
  });

  await writeAuditLog({
    userId: authz.session!.user.id,
    batchId,
    entity: "Media",
    entityId: media.id,
    action: "CREATE",
    diff: {
      type,
      source,
      urlOrPath,
      caption,
      pipelineStatus: media.pipelineStatus,
    },
  });

  if (isLocalVideo) {
    after(() => {
      scheduleMediaPipeline(media.id);
    });
  }

  return NextResponse.json(media, { status: 201 });
}
