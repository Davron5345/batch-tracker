import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const authz = await requirePermission("directories:read");
  if (authz.error) return authz.error;

  const activeOnly = req.nextUrl.searchParams.get("active") === "1";
  const units = await prisma.unitOfMeasure.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
  });
  return NextResponse.json(units);
}

export async function POST(req: NextRequest) {
  const authz = await requirePermission("directories:write");
  if (authz.error) return authz.error;

  const body = await req.json();
  const code = String(body.code || "").trim().toLowerCase();
  const symbol = body.symbol ? String(body.symbol).trim() : null;
  const nameRu = String(body.nameRu || "").trim();
  const nameUz = String(body.nameUz || "").trim();
  const nameEn = String(body.nameEn || "").trim();
  const sortOrder = Number.isFinite(Number(body.sortOrder))
    ? Number(body.sortOrder)
    : 0;

  if (!code || !nameRu || !nameUz || !nameEn) {
    return NextResponse.json(
      { error: "Код и названия на 3 языках обязательны" },
      { status: 400 }
    );
  }

  try {
    const unit = await prisma.unitOfMeasure.create({
      data: { code, symbol, nameRu, nameUz, nameEn, sortOrder },
    });
    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "UnitOfMeasure",
      entityId: unit.id,
      action: "CREATE",
      diff: { code, symbol, nameRu, nameUz, nameEn, sortOrder },
    });
    return NextResponse.json(unit, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Единица с таким кодом уже существует" },
      { status: 409 }
    );
  }
}
