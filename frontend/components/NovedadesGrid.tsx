"use client";

import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/lib/admin-store";

export default function NovedadesGrid() {
  const { products, ready, error } = useProducts();

  return (
    <>
      <h2 className="font-display text-2xl font-semibold">Novedades</h2>

      {error ? (
        <p className="mt-6 border border-dashed border-border p-8 text-center text-sm text-text-muted">
          {error}
        </p>
      ) : !ready ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-4/3 animate-pulse border border-border bg-surface"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-6 border border-dashed border-border p-8 text-center text-sm text-text-muted">
          Aún no hay productos publicados. Agrégalos desde el panel de
          administración.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
