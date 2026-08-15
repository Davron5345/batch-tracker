import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { requirePermission } from "@/lib/api-auth";

export const runtime = "nodejs";

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

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
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
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({
    urlOrPath: `/uploads/${filename}`,
    type: isImage ? "photo" : "video",
    source: "upload",
  });
}
