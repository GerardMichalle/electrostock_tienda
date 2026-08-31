"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import type { Product } from "@/lib/data";
import ProductGallery from "@/components/ProductGallery";
import { useCart } from "@/lib/cart-context";
import { useFlyToCart } from "@/lib/fly-to-cart";

const stockStyles: Record<Product["stock"], string> = {
  "En stock": "bg-accent-cyan/10 text-sky-700",
  Agotado: "bg-surface text-text-muted",
  "Bajo pedido": "bg-amber-50 text-amber-700",
};

export default function QuickViewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const { flyToCart } = useFlyToCart();
  const galleryRef = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState(1);
  const soldOut = product.stock === "Agotado";
  const href = `/${product.categorySlug}/${product.subcategorySlug}/${product.slug}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  function handleAdd() {
    if (!product.id) return;
    // flyToCart captura la posición de la galería de forma síncrona, así que
    // podemos cerrar el modal enseguida y el clon vuela sobre el header visible.
    flyToCart({
      origin: galleryRef.current,
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
    onClose();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista rápida: ${product.name}`}
    >
      <div
        className="relative my-auto w-full max-w-3xl border border-border bg-bg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar vista rápida"
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center border border-border bg-bg text-text-muted transition hover:border-accent hover:text-accent"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
          <div ref={galleryRef}>
            <ProductGallery
              gallery={product.gallery}
              videoUrl={product.videoUrl}
              productName={product.name}
            />
          </div>

          <div className="flex flex-col">
            <p className="select-text font-mono text-[11px] uppercase tracking-wider text-text-muted">
              SKU {product.sku}
            </p>
            <h2 className="mt-1 select-text pr-8 font-display text-xl font-bold leading-snug">
              {product.name}
            </h2>

            <div className="mt-3 flex items-center gap-3">
              <span className="select-text font-display text-2xl font-bold text-accent">
                S/ {product.price.toFixed(2)}
              </span>
              <span
                className={`px-2 py-0.5 text-[11px] font-medium ${stockStyles[product.stock]}`}
              >
                {product.stock}
              </span>
            </div>

            <p className="mt-4 select-text text-sm leading-relaxed text-text-muted">
              {product.description}
            </p>

            <div className="mt-4 border border-border bg-surface p-3">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Especificaciones
              </p>
              <p className="mt-1.5 select-text font-mono text-xs">{product.spec}</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 text-text-muted transition hover:text-accent"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
                <span className="w-10 text-center font-mono text-sm">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 py-2.5 text-text-muted transition hover:text-accent"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={soldOut}
                className="flex flex-1 items-center justify-center gap-1.5 border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:border-border disabled:bg-surface disabled:text-text-muted"
              >
                {soldOut ? "No disponible" : "Añadir al carrito"}
              </button>
            </div>

            <Link
              href={href}
              onClick={onClose}
              className="mt-4 inline-flex text-sm font-medium text-accent transition hover:underline"
            >
              Ver ficha completa →
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
