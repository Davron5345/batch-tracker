import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { requirePermission } from "@/lib/api-auth";
import { uploadsAbsDir, uploadPublicPath } from "@/lib/storage-paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 200 * 1024 * 1024; // 200 MB
const ALLOWED_IMAGE = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_VIDEO = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export async function POST(req: NextRequest) {
  const authz = await requirePermission("media:write");
  if (authz.error) return authz.error;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Не удалось прочитать файл (слишком большой или обрыв связи)" },
      { status: 400 }
    );
  }

  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Пустой файл" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Файл слишком большой (макс. 200 МБ)" },
      { status: 400 }
    );
  }

  const isImage = ALLOWED_IMAGE.has(file.type);
  const isVideo = ALLOWED_VIDEO.has(file.type);
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Допустимы JPEG/PNG/WebP/GIF и MP4/WebM/MOV" },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name) || (isImage ? ".jpg" : ".mp4");
  const filename = `${Date.now()}-${nanoid(8)}${ext}`;
  const dir = uploadsAbsDir();
  await mkdir(dir, { recursive: true });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      { error: "Не удалось сохранить файл на диск" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    urlOrPath: uploadPublicPath(filename),
    type: isImage ? "photo" : "video",
    source: "upload",
  });
}
