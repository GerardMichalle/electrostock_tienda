// Tipos compartidos del catálogo. Los datos ya NO viven aquí: vienen de la API
// (ver lib/api.ts + lib/adapters.ts). Este archivo solo define las formas que
// consumen los componentes.

export type Subcategory = {
  /** id de la base (para operaciones del admin). Ausente en datos aún no cargados. */
  id?: string;
  slug: string;
  name: string;
};

export type Category = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
  /** cantidad de productos en la categoría (lo da la API en el listado). */
  productCount?: number;
};

export type Product = {
  id?: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  categorySlug: string;
  subcategorySlug: string;
  categoryName?: string;
  subcategoryName?: string;
  /** ids de la base (para el formulario del admin). */
  categoryId?: string;
  subcategoryId?: string;
  stock: "En stock" | "Agotado" | "Bajo pedido";
  spec: string;
  image: string;
  description: string;
  gallery: string[];
  videoUrl?: string;
  /** fotos con su id (para poder eliminarlas una por una en el admin). */
  images?: { id: string; url: string }[];
};
