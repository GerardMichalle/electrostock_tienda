"use client";

import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/lib/admin-store";
import { getSaleInfo } from "@/lib/price";

// 4 columnas × 2 filas en desktop.
const MAX = 8;

/**
 * Sección "Ofertas" de la home: productos con precio anterior (`compareAtPrice`
 * mayor que el precio). Si no hay ninguno en oferta, la sección no se muestra.
 * El cliente marca una oferta poniendo el "Precio anterior" en el panel.
 */
export default function OfertasGrid() {
  const { products, ready } = useProducts();
  const onSale = products
    .filter((p) => getSaleInfo(p).onSale)
    .slice(0, MAX);

  if (!ready || onSale.length === 0) return null;

  return (
    <section id="ofertas" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold">Ofertas</h2>
        <p className="mt-2 max-w-xl text-sm text-text-muted">
          Productos con descuento por tiempo limitado.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {onSale.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
