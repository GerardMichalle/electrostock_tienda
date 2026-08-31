// Traduce las respuestas de la API a los tipos que ya usa el frontend
// (`Product`, `Category` de `lib/data.ts`).

import type { Category, Product } from "@/lib/data";
import { assetUrl } from "@/lib/api";

// ---- Formas que devuelve la API ----

export type ApiStock = "EN_STOCK" | "AGOTADO" | "BAJO_PEDIDO";

export type ApiCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  order: number;
  subcategories: ApiSubcategory[];
  _count?: { products: number };
};

export type ApiSubcategory = {
  id: string;
  slug: string;
  name: string;
  order: number;
  categoryId: string;
};

export type ApiProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  price: string; // Prisma Decimal → string
  stock: ApiStock;
  spec: string | null;
  description: string | null;
  videoUrl: string | null;
  categoryId: string;
  subcategoryId: string;
  images: { id: string; url: string; order: number }[];
  category: ApiCategory;
  subcategory: ApiSubcategory;
};

// ---- Stock: enum de la API ⇆ texto que muestra el frontend ----

export const STOCK_FROM_API: Record<ApiStock, Product["stock"]> = {
  EN_STOCK: "En stock",
  AGOTADO: "Agotado",
  BAJO_PEDIDO: "Bajo pedido",
};

export const STOCK_TO_API: Record<Product["stock"], ApiStock> = {
  "En stock": "EN_STOCK",
  Agotado: "AGOTADO",
  "Bajo pedido": "BAJO_PEDIDO",
};

// ---- Adaptadores ----

export function adaptCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    productCount: c._count?.products ?? 0,
    subcategories: (c.subcategories ?? []).map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
    })),
  };
}

export function adaptProduct(p: ApiProduct): Product {
  const gallery = (p.images ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((i) => assetUrl(i.url));

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
    categorySlug: p.category?.slug ?? "",
    subcategorySlug: p.subcategory?.slug ?? "",
    categoryName: p.category?.name,
    subcategoryName: p.subcategory?.name,
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId,
    stock: STOCK_FROM_API[p.stock] ?? "En stock",
    spec: p.spec ?? "",
    description: p.description ?? "",
    image: gallery[0] ?? "",
    gallery,
    videoUrl: p.videoUrl ?? undefined,
    images: (p.images ?? []).map((i) => ({ id: i.id, url: assetUrl(i.url) })),
  };
}
