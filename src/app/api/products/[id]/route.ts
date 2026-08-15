import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

function parseProductBody(body: Record<string, unknown>, sku: string) {
  const nameRu = String(body.nameRu || body.name || "").trim();
  const nameUz = String(body.nameUz || "").trim();
  const nameEn = String(body.nameEn || "").trim();
  const descriptionRu = body.descriptionRu
    ? String(body.descriptionRu).trim()
    : body.description
      ? String(body.description).trim()
      : null;
  const descriptionUz = body.descriptionUz
    ? String(body.descriptionUz).trim()
    : null;
  const descriptionEn = body.descriptionEn
    ? String(body.descriptionEn).trim()
    : null;
  const unitId = body.unitId ? String(body.unitId).trim() : null;
  const categoryId = body.categoryId ? String(body.categoryId).trim() : null;

  return {
    name: nameRu,
    nameRu,
    nameUz,
    nameEn,
    sku,
    description: descriptionRu,
    descriptionRu,
    descriptionUz,
    descriptionEn,
    unitId: unitId || null,
    categoryId: categoryId || null,
  };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const authz = await requirePermission("products:read");
  if (authz.error) return authz.error;

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      unit: true,
      category: true,
      batches: {
        orderBy: { manufacturedAt: "desc" },
        include: { _count: { select: { media: true } } },
      },
    },
  });
  if (!product) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const authz = await requirePermission("products:write");
  if (authz.error) return authz.error;

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  const body = await req.json();
  const nameRu = String(body.nameRu || body.name || "").trim();
  if (!nameRu) {
    return NextResponse.json(
      { error: "Название (RU) обязательно" },
      { status: 400 }
    );
  }

  // SKU is immutable after create
  const data = parseProductBody(body, existing.sku);

  try {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: { unit: true, category: true },
    });
    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "Product",
      entityId: product.id,
      action: "UPDATE",
      diff: data,
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Не удалось обновить товар" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const authz = await requirePermission("products:write");
  if (authz.error) return authz.error;

  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "Product",
      entityId: id,
      action: "DELETE",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }
}
