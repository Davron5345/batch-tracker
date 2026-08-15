import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const authz = await requirePermission("products:read");
  if (authz.error) return authz.error;

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : undefined,
    include: { _count: { select: { batches: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const authz = await requirePermission("products:write");
  if (authz.error) return authz.error;

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
    const product = await prisma.product.create({
      data: { name, sku, description },
    });
    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "Product",
      entityId: product.id,
      action: "CREATE",
      diff: { name, sku, description },
    });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Товар с таким артикулом уже существует" },
      { status: 409 }
    );
  }
}
