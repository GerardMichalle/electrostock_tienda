"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Search, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/data";
import ProductImage from "@/components/ProductImage";
import QuickViewModal from "@/components/QuickViewModal";
import { useCart } from "@/lib/cart-context";

const stockStyles: Record<Product["stock"], string> = {
  "En stock": "bg-accent-cyan/10 text-sky-700",
  Agotado: "bg-surface text-text-muted",
  "Bajo pedido": "bg-amber-50 text-amber-700",
};

export default function ProductCard({ product }: { product: Product }) {
  const href = `/${product.categorySlug}/${product.subcategorySlug}/${product.slug}`;
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const soldOut = product.stock === "Agotado";

  function handleAdd() {
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      categorySlug: product.categorySlug,
      subcategorySlug: product.subcategorySlug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article className="corner-marks group flex flex-col overflow-hidden border border-border bg-bg transition hover:shadow-md">
      <span className="cm-tr" />
      <span className="cm-br" />

      <div className="relative">
        <Link
          href={href}
          aria-label={product.name}
          className="flex aspect-square items-center justify-center border-b border-border bg-surface"
        >
          <ProductImage src={product.image} alt={product.name} />
        </Link>
        <button
          type="button"
          onClick={() => setQuickOpen(true)}
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 border-t border-border bg-bg/95 py-2 text-xs font-medium text-text backdrop-blur transition-opacity hover:text-accent lg:opacity-0 lg:group-hover:opacity-100"
        >
          <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          Vista rápida
        </button>
      </div>

      <Link
        href={href}
        className="flex flex-1 flex-col gap-2 p-3 sm:gap-2.5 sm:p-4"
      >
        <div>
          <p className="select-text font-mono text-[10px] uppercase tracking-wider text-text-muted sm:text-[11px]">
            SKU {product.sku}
          </p>
          <h3 className="mt-1 line-clamp-2 select-text font-display text-[13px] font-semibold leading-snug sm:text-[15px]">
            {product.name}
          </h3>
        </div>

        <p className="line-clamp-1 font-mono text-[11px] text-text-muted sm:text-xs">
          {product.spec}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-dashed border-border pt-2.5">
          <span className="select-text font-display text-base font-bold text-accent sm:text-lg">
            S/ {product.price.toFixed(2)}
          </span>
          <span
            className={`px-2 py-0.5 text-[10px] font-medium sm:text-[11px] ${stockStyles[product.stock]}`}
          >
            {product.stock}
          </span>
        </div>
      </Link>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <button
          onClick={handleAdd}
          disabled={soldOut}
          className="flex w-full items-center justify-center gap-1.5 border border-accent bg-accent py-2 text-xs font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:border-border disabled:bg-surface disabled:text-text-muted sm:text-sm"
        >
          {soldOut ? (
            "No disponible"
          ) : added ? (
            <>
              <Check className="h-4 w-4 shrink-0" strokeWidth={2} />
              Añadido
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="sm:hidden">Añadir</span>
              <span className="hidden sm:inline">Añadir al carrito</span>
            </>
          )}
        </button>
      </div>

      {quickOpen && (
        <QuickViewModal
          product={product}
          onClose={() => setQuickOpen(false)}
        />
      )}
    </article>
  );
}
