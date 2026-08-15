import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync, statSync } from "fs";
import { Readable } from "stream";
import path from "path";
import { uploadsAbsDir, resolveUploadAbs } from "@/lib/storage-paths";

type Params = { params: Promise<{ path: string[] }> };

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: Params) {
  const parts = (await params).path || [];
  if (parts.length !== 1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filename = parts[0];
  let abs: string;
  try {
    abs = resolveUploadAbs(`/uploads/${filename}`);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Ensure resolved path stays inside uploads dir
  const root = path.resolve(uploadsAbsDir());
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!existsSync(abs)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const st = statSync(abs);
  const ext = path.extname(filename).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const nodeStream = createReadStream(abs);
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Length": String(st.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
