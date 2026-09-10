"use client";

import { useRef, useState } from "react";
import { useCart, CART_MAX_QTY } from "@/lib/cart-context";
import { useFlyToCart } from "@/lib/fly-to-cart";
import type { Product } from "@/lib/data";

export default function AddToCartBar({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { flyToCart } = useFlyToCart();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const disabled = product.stock === "Agotado";
  const atMax = qty >= CART_MAX_QTY;

  function handleAdd() {
    if (!product.id) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    flyToCart({
      origin: btnRef.current,
      image: product.image,
      onArrive: () =>
        addItem(
          {
            productId: product.id!,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            categorySlug: product.categorySlug,
            subcategorySlug: product.subcategorySlug,
          },
          qty,
        ),
    });
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5">
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
          onClick={() => setQty((q) => Math.min(CART_MAX_QTY, q + 1))}
          disabled={atMax}
          className="px-3 py-2.5 text-sm text-text-muted transition hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      <button
        ref={btnRef}
        onClick={handleAdd}
        disabled={disabled}
        className="flex-1 border border-accent bg-accent py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:border-border disabled:bg-surface disabled:text-text-muted sm:flex-none sm:px-8"
      >
        {disabled ? "No disponible" : added ? "✓ Añadido al carrito" : "Añadir al carrito"}
      </button>

      {atMax && (
        <p className="w-full font-mono text-[11px] text-text-muted">
          Máximo {CART_MAX_QTY} unidades por producto. ¿Necesitas más? Escríbenos por WhatsApp.
        </p>
      )}
    </div>
  );
}
