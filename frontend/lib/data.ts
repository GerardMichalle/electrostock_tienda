

export type Subcategory = {
  
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

/** Ficha ampliada opcional del producto (columna `details` en la API). */
export type ProductDetails = {

  info?: string;

  advantages?: { title: string; body: string }[];
 
  benefits?: string[];

  applications?: string[];
  
  techSpecs?: { label: string; value: string }[];
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

  categoryId?: string;
  subcategoryId?: string;
  stock: "En stock" | "Agotado" | "Bajo pedido";
  spec: string;
  image: string;
  description: string;
 
  details?: ProductDetails;
  gallery: string[];
  videoUrl?: string;
 
  images?: { id: string; url: string }[];
};
