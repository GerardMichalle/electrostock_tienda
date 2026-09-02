import type { Product } from "@/lib/data";

export type SaleInfo = {
  /** true si hay un precio anterior válido (mayor que el actual). */
  onSale: boolean;
  /** precio a pagar */
  price: number;
  /** precio anterior tachado (solo si onSale) */
  was: number | null;
  /** porcentaje de descuento redondeado (solo si onSale), ej. 20 */
  percentOff: number;
};

/** Calcula el estado de oferta de un producto en un solo lugar. */
export function getSaleInfo(product: Pick<Product, "price" | "compareAtPrice">): SaleInfo {
  const was = product.compareAtPrice ?? 0;
  const onSale = was > product.price;
  return {
    onSale,
    price: product.price,
    was: onSale ? was : null,
    percentOff: onSale ? Math.round(((was - product.price) / was) * 100) : 0,
  };
}

export function formatSoles(value: number): string {
  return `S/ ${value.toFixed(2)}`;
}
