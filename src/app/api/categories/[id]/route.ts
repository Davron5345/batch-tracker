import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const authz = await requirePermission("directories:write");
  if (authz.error) return authz.error;

  const { id } = await params;
  const body = await req.json();
  const code = String(body.code || "").trim().toLowerCase();
  const nameRu = String(body.nameRu || "").trim();
  const nameUz = String(body.nameUz || "").trim();
  const nameEn = String(body.nameEn || "").trim();
  const sortOrder = Number.isFinite(Number(body.sortOrder))
    ? Number(body.sortOrder)
    : 0;
  const isActive = body.isActive !== false;

  if (!code || !nameRu || !nameUz || !nameEn) {
    return NextResponse.json(
      { error: "Код и названия на 3 языках обязательны" },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { code, nameRu, nameUz, nameEn, sortOrder, isActive },
    });
    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "Category",
      entityId: category.id,
      action: "UPDATE",
      diff: { code, nameRu, nameUz, nameEn, sortOrder, isActive },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const authz = await requirePermission("directories:write");
  if (authz.error) return authz.error;

  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "Category",
      entityId: id,
      action: "DELETE",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
  }
}
