import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@local" },
  });

  if (existing) {
    console.log("Seed: admin@local already exists — skip password reset");
    return;
  }

  const passwordHash = await bcrypt.hash("Admin123!", 12);
  await prisma.user.create({
    data: {
      email: "admin@local",
      passwordHash,
      role: "SUPER_ADMIN",
      name: "Супер-админ",
    },
  });

  console.log("Seed complete: admin@local / Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
