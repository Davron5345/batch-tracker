import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { generateUniqueSku } from "@/lib/sku";

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

export async function GET(req: NextRequest) {
  const authz = await requirePermission("products:read");
  if (authz.error) return authz.error;

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { nameRu: { contains: q, mode: "insensitive" } },
            { nameUz: { contains: q, mode: "insensitive" } },
            { nameEn: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { descriptionRu: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { batches: true } },
      unit: true,
      category: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const authz = await requirePermission("products:write");
  if (authz.error) return authz.error;

  const body = await req.json();
  const nameRu = String(body.nameRu || body.name || "").trim();
  if (!nameRu) {
    return NextResponse.json(
      { error: "Название (RU) обязательно" },
      { status: 400 }
    );
  }

  // SKU always auto-assigned on create (manual override ignored)
  const sku = await generateUniqueSku();
  const data = parseProductBody(body, sku);

  try {
    const product = await prisma.product.create({
      data,
      include: { unit: true, category: true },
    });
    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "Product",
      entityId: product.id,
      action: "CREATE",
      diff: data,
    });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Не удалось создать товар" },
      { status: 400 }
    );
  }
}
