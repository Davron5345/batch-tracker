import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-auth";
import { processMediaPipeline } from "@/lib/media-pipeline";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/** Manual retry of YouTube/archive pipeline for one media item */
export async function POST(_req: NextRequest, { params }: Params) {
  const authz = await requirePermission("media:write");
  if (authz.error) return authz.error;

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Медиа не найдено" }, { status: 404 });
  }
  if (media.type !== "video") {
    return NextResponse.json(
      { error: "Пайплайн только для видео" },
      { status: 400 }
    );
  }

  const result = await processMediaPipeline(id);
  const updated = await prisma.media.findUnique({ where: { id } });
  return NextResponse.json({ result, media: updated });
}
