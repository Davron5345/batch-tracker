import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authz = await requirePermission("audit:read");
  if (authz.error) return authz.error;

  const take = Math.min(Number(req.nextUrl.searchParams.get("take") || 50), 200);
  const entity = req.nextUrl.searchParams.get("entity")?.trim();

  const logs = await prisma.auditLog.findMany({
    where: entity ? { entity } : undefined,
    include: {
      user: { select: { id: true, email: true, name: true } },
      batch: { select: { id: true, batchNumber: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json(logs);
}
