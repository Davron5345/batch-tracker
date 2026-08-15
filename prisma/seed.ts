import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_UNITS = [
  {
    code: "pcs",
    symbol: "шт",
    nameRu: "Штука",
    nameUz: "Dona",
    nameEn: "Piece",
    sortOrder: 1,
  },
  {
    code: "kg",
    symbol: "кг",
    nameRu: "Килограмм",
    nameUz: "Kilogramm",
    nameEn: "Kilogram",
    sortOrder: 2,
  },
  {
    code: "g",
    symbol: "г",
    nameRu: "Грамм",
    nameUz: "Gramm",
    nameEn: "Gram",
    sortOrder: 3,
  },
  {
    code: "l",
    symbol: "л",
    nameRu: "Литр",
    nameUz: "Litr",
    nameEn: "Liter",
    sortOrder: 4,
  },
  {
    code: "m",
    symbol: "м",
    nameRu: "Метр",
    nameUz: "Metr",
    nameEn: "Meter",
    sortOrder: 5,
  },
  {
    code: "pack",
    symbol: "уп",
    nameRu: "Упаковка",
    nameUz: "Qadoq",
    nameEn: "Pack",
    sortOrder: 6,
  },
];

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@local" },
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash("Admin123!", 12);
    await prisma.user.create({
      data: {
        email: "admin@local",
        passwordHash,
        role: "SUPER_ADMIN",
        name: "Супер-админ",
      },
    });
    console.log("Seed: admin@local / Admin123!");
  } else {
    console.log("Seed: admin@local already exists — skip password reset");
  }

  for (const unit of DEFAULT_UNITS) {
    await prisma.unitOfMeasure.upsert({
      where: { code: unit.code },
      update: {
        symbol: unit.symbol,
        nameRu: unit.nameRu,
        nameUz: unit.nameUz,
        nameEn: unit.nameEn,
        sortOrder: unit.sortOrder,
        isActive: true,
      },
      create: unit,
    });
  }
  console.log(`Seed: ${DEFAULT_UNITS.length} units of measure`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
