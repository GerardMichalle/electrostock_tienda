-- ============================================================================
--  AMYTRONICS  ·  Esquema de base de datos (estado actual)
--  Motor: PostgreSQL   ·   ORM: Prisma 6   ·   Hosting: Neon
--  Generado desde backend/prisma/schema.prisma el 2026-09-08
--
--  Cómo verlo en Lucidchart:
--    Archivo  ->  Importar diagrama  ->  Base de datos  ->  "Importar desde SQL"
--    Elige PostgreSQL, pega/sube este archivo y Lucidchart dibuja el ERD solo
--    (tablas, columnas, PK/FK y las relaciones 1:N con pata de gallo).
--
--  Si el importador se queja de las 4 líneas "CREATE TYPE ... AS ENUM",
--  bórralas: las columnas de tipo enum quedarán como texto, sin afectar el ERD.
-- ============================================================================

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('EN_STOCK', 'AGOTADO', 'BAJO_PEDIDO');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('YAPE', 'PLIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDIENTE_VERIFICACION', 'PAGO_VERIFICADO', 'RECHAZADO', 'ENVIADO', 'ENTREGADO');

-- ----------------------------------------------------------------------------
--  store_settings — Ajustes editables de la tienda (una sola fila, id = 'main')
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
--  users — Usuarios del panel de administración (login con JWT)
-- ----------------------------------------------------------------------------
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
--  categories — Categorías del catálogo
-- ----------------------------------------------------------------------------
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
--  subcategories — Subcategorías (cada una pertenece a una categoría)
-- ----------------------------------------------------------------------------
CREATE TABLE "subcategories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
--  products — Productos del catálogo
-- ----------------------------------------------------------------------------
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "compareAtPrice" DECIMAL(10,2),
    "stock" "StockStatus" NOT NULL DEFAULT 'EN_STOCK',
    "spec" TEXT,
    "description" TEXT,
    "details" JSONB,
    "videoUrl" TEXT,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
--  product_images — Fotos de cada producto (galería ordenada)
-- ----------------------------------------------------------------------------
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
--  orders — Pedidos recibidos (pago por Yape / Plin con comprobante)
-- ----------------------------------------------------------------------------
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "receiptUrl" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDIENTE_VERIFICACION',
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
--  order_items — Líneas de cada pedido (guardan copia de nombre/precio)
-- ----------------------------------------------------------------------------
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
--  Índices y claves únicas
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "subcategories_categoryId_slug_key" ON "subcategories"("categoryId", "slug");
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "products_subcategoryId_idx" ON "products"("subcategoryId");
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- ---------------------------------------------------------------------------
--  Relaciones (claves foráneas)  ·  todas 1:N
-- ---------------------------------------------------------------------------

-- categories 1 --- N subcategories   (al borrar la categoría se borran sus subcategorías)
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- categories 1 --- N products        (no se puede borrar una categoría con productos)
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- subcategories 1 --- N products     (no se puede borrar una subcategoría con productos)
ALTER TABLE "products" ADD CONSTRAINT "products_subcategoryId_fkey"
    FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- products 1 --- N product_images    (al borrar el producto se borran sus fotos)
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- orders 1 --- N order_items         (al borrar el pedido se borran sus líneas)
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- products 1 --- N order_items       (si se borra el producto, la línea queda con productId = NULL)
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
