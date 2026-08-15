import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ token: string }> };

/** Public poll endpoint for QR document video / YouTube pipeline status */
export async function GET(_req: Request, { params }: Params) {
  const { token } = await params;
  const batch = await prisma.batch.findUnique({
    where: { publicToken: token },
    select: {
      status: true,
      media: {
        where: { type: "video" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          source: true,
          urlOrPath: true,
          caption: true,
          pipelineStatus: true,
          youtubeVideoId: true,
          localPath: true,
        },
      },
    },
  });

  if (!batch || batch.status === "ARCHIVED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    { videos: batch.media },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
