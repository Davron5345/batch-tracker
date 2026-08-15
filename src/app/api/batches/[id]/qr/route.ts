import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { generateQrPngBuffer, batchPublicUrl } from "@/lib/qr";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const authz = await requirePermission("batches:read");
  if (authz.error) return authz.error;

  const { id } = await params;
  const batch = await prisma.batch.findUnique({ where: { id } });
  if (!batch) {
    return NextResponse.json({ error: "Партия не найдена" }, { status: 404 });
  }

  const format = req.nextUrl.searchParams.get("format");
  if (format === "json") {
    return NextResponse.json({
      url: batchPublicUrl(batch.publicToken),
      token: batch.publicToken,
    });
  }

  const download = req.nextUrl.searchParams.get("download") === "1";
  const buffer = await generateQrPngBuffer(batch.publicToken);
  const headers: Record<string, string> = {
    "Content-Type": "image/png",
    "Cache-Control": "private, max-age=60",
  };
  if (download) {
    headers["Content-Disposition"] =
      `attachment; filename="batch-${batch.batchNumber}-qr.png"`;
  }

  return new NextResponse(new Uint8Array(buffer), { headers });
}
