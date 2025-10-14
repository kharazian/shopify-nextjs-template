-- CreateTable
CREATE TABLE "Store" (
    "shop" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("shop")
);

-- CreateTable
CREATE TABLE "ShopifySession" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "content" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "expires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Store_shop_idx" ON "Store"("shop");

-- CreateIndex
CREATE INDEX "ShopifySession_id_idx" ON "ShopifySession"("id");

-- CreateIndex
CREATE INDEX "ShopifySession_shop_idx" ON "ShopifySession"("shop");
