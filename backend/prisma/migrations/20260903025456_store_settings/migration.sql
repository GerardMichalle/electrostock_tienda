-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "businessName" TEXT,
    "yapeNumber" TEXT,
    "yapeQrUrl" TEXT,
    "plinNumber" TEXT,
    "plinQrUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
