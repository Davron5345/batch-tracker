import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { deleteArchiveFile } from "@/lib/archive";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const authz = await requirePermission("media:write");
  if (authz.error) return authz.error;

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Медиа не найдено" }, { status: 404 });
  }

  await prisma.media.delete({ where: { id } });

  const localCandidates = [media.localPath, media.urlOrPath].filter(
    (p): p is string => Boolean(p && p.startsWith("/uploads/"))
  );
  for (const p of new Set(localCandidates)) {
    try {
      await unlink(path.join(process.cwd(), "public", p.replace(/^\//, "")));
    } catch {
      // ignore
    }
  }

  await deleteArchiveFile(media.archivePath);

  await writeAuditLog({
    userId: authz.session!.user.id,
    batchId: media.batchId,
    entity: "Media",
    entityId: id,
    action: "DELETE",
    diff: {
      urlOrPath: media.urlOrPath,
      type: media.type,
      source: media.source,
      archivePath: media.archivePath,
    },
  });

  return NextResponse.json({ ok: true });
}
