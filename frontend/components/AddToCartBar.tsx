"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/data";

export default function AddToCartBar({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const disabled = product.stock === "Agotado";

  function handleAdd() {
    addItem(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        categorySlug: product.categorySlug,
        subcategorySlug: product.subcategorySlug,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center border border-border">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-3 py-2.5 text-sm text-text-muted transition hover:text-accent"
          aria-label="Disminuir cantidad"
        >
          −
        </button>
        <span className="w-10 text-center font-mono text-sm">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="px-3 py-2.5 text-sm text-text-muted transition hover:text-accent"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={disabled}
        className="flex-1 border border-accent bg-accent py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:border-border disabled:bg-surface disabled:text-text-muted sm:flex-none sm:px-8"
      >
        {disabled ? "No disponible" : added ? "✓ Añadido al carrito" : "Añadir al carrito"}
      </button>
    </div>
  );
}
