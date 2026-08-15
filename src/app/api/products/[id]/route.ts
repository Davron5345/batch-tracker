import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const authz = await requirePermission("products:read");
  if (authz.error) return authz.error;

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      batches: { orderBy: { manufacturedAt: "desc" }, include: { _count: { select: { media: true } } } },
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
  const body = await req.json();
  const name = String(body.name || "").trim();
  const sku = String(body.sku || "").trim();
  const description = body.description ? String(body.description).trim() : null;

  if (!name || !sku) {
    return NextResponse.json(
      { error: "Название и артикул обязательны" },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: { name, sku, description },
    });
    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "Product",
      entityId: product.id,
      action: "UPDATE",
      diff: { name, sku, description },
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
