// Traduce las respuestas de la API a los tipos que ya usa el frontend
// (`Product`, `Category` de `lib/data.ts`).

import type { Category, Product, ProductDetails } from "@/lib/data";
import { assetUrl } from "@/lib/api";

// ---- Formas que devuelve la API aca ejemplo ----

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
  price: string; // Prisma Decimal → string tipo
  compareAtPrice: string | null;
  stock: ApiStock;
  spec: string | null;
  description: string | null;
  details: ProductDetails | null;
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

/** Normaliza la ficha ampliada; devuelve undefined si no trae contenido real. */
function adaptDetails(d: ProductDetails | null | undefined): ProductDetails | undefined {
  if (!d) return undefined;
  const out: ProductDetails = {};
  if (d.info?.trim()) out.info = d.info.trim();
  const advantages = (d.advantages ?? []).filter((a) => a?.title && a?.body);
  if (advantages.length) out.advantages = advantages;
  const benefits = (d.benefits ?? []).filter(Boolean);
  if (benefits.length) out.benefits = benefits;
  const applications = (d.applications ?? []).filter(Boolean);
  if (applications.length) out.applications = applications;
  const techSpecs = (d.techSpecs ?? []).filter((t) => t?.label && t?.value);
  if (techSpecs.length) out.techSpecs = techSpecs;
  return Object.keys(out).length ? out : undefined;
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
    compareAtPrice:
      p.compareAtPrice != null ? Number(p.compareAtPrice) : undefined,
    categorySlug: p.category?.slug ?? "",
    subcategorySlug: p.subcategory?.slug ?? "",
    categoryName: p.category?.name,
    subcategoryName: p.subcategory?.name,
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId,
    stock: STOCK_FROM_API[p.stock] ?? "En stock",
    spec: p.spec ?? "",
    description: p.description ?? "",
    details: adaptDetails(p.details),
    image: gallery[0] ?? "",
    gallery,
    videoUrl: p.videoUrl ?? undefined,
    images: (p.images ?? []).map((i) => ({ id: i.id, url: assetUrl(i.url) })),
  };
}
