import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { stringifyCharacteristics, type Characteristic } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const authz = await requirePermission("batches:read");
  if (authz.error) return authz.error;

  const { id } = await params;
  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      product: true,
      media: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!batch) {
    return NextResponse.json({ error: "Партия не найдена" }, { status: 404 });
  }
  return NextResponse.json(batch);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const authz = await requirePermission("batches:write");
  if (authz.error) return authz.error;

  const { id } = await params;
  const body = await req.json();
  const batchNumber = String(body.batchNumber || "").trim();
  const manufacturedAt = body.manufacturedAt ? new Date(body.manufacturedAt) : null;
  const status = body.status === "ARCHIVED" ? "ARCHIVED" : "ACTIVE";
  const characteristics = Array.isArray(body.characteristics)
    ? (body.characteristics as Characteristic[])
    : [];
  const productId = body.productId ? String(body.productId).trim() : undefined;

  if (!batchNumber || !manufacturedAt || Number.isNaN(manufacturedAt.getTime())) {
    return NextResponse.json(
      { error: "Номер партии и дата изготовления обязательны" },
      { status: 400 }
    );
  }

  try {
    const batch = await prisma.batch.update({
      where: { id },
      data: {
        batchNumber,
        manufacturedAt,
        status,
        characteristics: stringifyCharacteristics(characteristics),
        ...(productId ? { productId } : {}),
      },
      include: { product: true, media: true },
    });

    await writeAuditLog({
      userId: authz.session!.user.id,
      batchId: batch.id,
      entity: "Batch",
      entityId: batch.id,
      action: "UPDATE",
      diff: {
        batchNumber,
        manufacturedAt,
        status,
        characteristics,
        productId,
      },
    });

    return NextResponse.json(batch);
  } catch {
    return NextResponse.json({ error: "Не удалось обновить партию" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const authz = await requirePermission("batches:write");
  if (authz.error) return authz.error;

  const { id } = await params;
  try {
    await prisma.batch.delete({ where: { id } });
    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "Batch",
      entityId: id,
      action: "DELETE",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Партия не найдена" }, { status: 404 });
  }
}
