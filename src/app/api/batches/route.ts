import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { stringifyCharacteristics, type Characteristic } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const authz = await requirePermission("batches:read");
  if (authz.error) return authz.error;

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const dateFrom = req.nextUrl.searchParams.get("dateFrom");
  const dateTo = req.nextUrl.searchParams.get("dateTo");

  const where: Prisma.BatchWhereInput = {};

  if (q) {
    where.OR = [
      { batchNumber: { contains: q } },
      { product: { name: { contains: q } } },
      { product: { sku: { contains: q } } },
      { publicToken: { contains: q } },
    ];
  }

  if (dateFrom || dateTo) {
    where.manufacturedAt = {};
    if (dateFrom) where.manufacturedAt.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      where.manufacturedAt.lte = end;
    }
  }

  const batches = await prisma.batch.findMany({
    where,
    include: {
      product: true,
      _count: { select: { media: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return NextResponse.json(batches);
}

export async function POST(req: NextRequest) {
  const authz = await requirePermission("batches:write");
  if (authz.error) return authz.error;

  const body = await req.json();
  const productId = String(body.productId || "").trim();
  const batchNumber = String(body.batchNumber || "").trim();
  const manufacturedAt = body.manufacturedAt ? new Date(body.manufacturedAt) : null;
  const status = body.status === "ARCHIVED" ? "ARCHIVED" : "ACTIVE";
  const characteristics = Array.isArray(body.characteristics)
    ? (body.characteristics as Characteristic[])
    : [];

  if (!productId || !batchNumber || !manufacturedAt || Number.isNaN(manufacturedAt.getTime())) {
    return NextResponse.json(
      { error: "Товар, номер партии и дата изготовления обязательны" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  try {
    const batch = await prisma.batch.create({
      data: {
        productId,
        batchNumber,
        manufacturedAt,
        status,
        characteristics: stringifyCharacteristics(characteristics),
        publicToken: nanoid(16),
      },
      include: { product: true },
    });

    await writeAuditLog({
      userId: authz.session!.user.id,
      batchId: batch.id,
      entity: "Batch",
      entityId: batch.id,
      action: "CREATE",
      diff: {
        productId,
        batchNumber,
        manufacturedAt,
        status,
        characteristics,
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Партия с таким номером уже существует для этого товара" },
      { status: 409 }
    );
  }
}
