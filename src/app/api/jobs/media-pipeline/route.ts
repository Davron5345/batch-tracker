import { NextRequest, NextResponse } from "next/server";
import {
  cleanupExpiredArchives,
  processPendingMedia,
} from "@/lib/media-pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorize(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Задайте CRON_SECRET в .env" },
      { status: 500 }
    );
  }
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = req.nextUrl.searchParams.get("secret") || "";
  if (token !== secret && query !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** Process pending YouTube uploads / archives + purge 90-day archives */
export async function POST(req: NextRequest) {
  const denied = authorize(req);
  if (denied) return denied;

  const processed = await processPendingMedia(5);
  const cleanup = await cleanupExpiredArchives();
  return NextResponse.json({ processed, cleanup });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
