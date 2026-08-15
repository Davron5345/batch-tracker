import { prisma } from "@/lib/prisma";

/** Auto SKU: PRD-000001, PRD-000002, … */
export async function generateUniqueSku(prefix = "PRD"): Promise<string> {
  const latest = await prisma.product.findFirst({
    where: { sku: { startsWith: `${prefix}-` } },
    orderBy: { sku: "desc" },
    select: { sku: true },
  });

  let next = 1;
  if (latest?.sku) {
    const match = latest.sku.match(new RegExp(`^${prefix}-(\\d+)$`, "i"));
    if (match) next = Number(match[1]) + 1;
  }

  for (let i = 0; i < 50; i++) {
    const sku = `${prefix}-${String(next + i).padStart(6, "0")}`;
    const exists = await prisma.product.findUnique({
      where: { sku },
      select: { id: true },
    });
    if (!exists) return sku;
  }

  return `${prefix}-${Date.now().toString().slice(-8)}`;
}
