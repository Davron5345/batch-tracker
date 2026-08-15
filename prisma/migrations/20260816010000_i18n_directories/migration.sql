-- CreateTable
CREATE TABLE "UnitOfMeasure" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT,
    "nameRu" TEXT NOT NULL,
    "nameUz" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_code_key" ON "UnitOfMeasure"("code");

-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN "nameRu" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "nameUz" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "nameEn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "descriptionRu" TEXT;
ALTER TABLE "Product" ADD COLUMN "descriptionUz" TEXT;
ALTER TABLE "Product" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "Product" ADD COLUMN "unitId" TEXT;

-- Backfill from legacy columns
UPDATE "Product" SET "nameRu" = "name" WHERE "nameRu" = '';
UPDATE "Product" SET "descriptionRu" = "description" WHERE "descriptionRu" IS NULL AND "description" IS NOT NULL;

-- CreateIndex
CREATE INDEX "Product_unitId_idx" ON "Product"("unitId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
