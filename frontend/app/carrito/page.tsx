"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/lib/cart-context";
import yapeBadge from "@/src/img/yape-badge.png";
import plinBadge from "@/src/img/plin-badge.png";

export default function CartPage() {
  const { items, ready, updateQty, removeItem, totalPrice } = useCart();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Carrito de compras
          </h1>

          {!ready ? (
            <p className="mt-6 text-sm text-text-muted">Cargando…</p>
          ) : items.length === 0 ? (
            <div className="mt-8 border border-dashed border-border p-10 text-center">
              <p className="text-text-muted">Tu carrito está vacío.</p>
              <Link
                href="/"
                className="mt-4 inline-block border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
              >
                Ver catálogo
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
              <div className="border border-border bg-bg">
                {items.map((item) => {
                  const href = `/${item.categorySlug}/${item.subcategorySlug}/${item.slug}`;
                  return (
                    <div
                      key={item.slug}
                      className="flex gap-3 border-b border-border p-4 last:border-0 sm:gap-4"
                    >
                      <Link
                        href={href}
                        className="h-16 w-16 shrink-0 overflow-hidden border border-border bg-surface"
                      >
                        <ProductImage src={item.image} alt={item.name} />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={href}
                            className="line-clamp-2 select-text font-display text-sm font-semibold hover:text-accent sm:truncate"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 select-text font-mono text-xs text-text-muted">
                            S/ {item.price.toFixed(2)} c/u
                          </p>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex shrink-0 items-center border border-border">
                            <button
                              onClick={() => updateQty(item.slug, item.qty - 1)}
                              className="px-3 py-2 text-sm text-text-muted hover:text-accent"
                              aria-label="Disminuir cantidad"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-mono text-sm">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.slug, item.qty + 1)}
                              className="px-3 py-2 text-sm text-text-muted hover:text-accent"
                              aria-label="Aumentar cantidad"
                            >
                              +
                            </button>
                          </div>

                          <p className="ml-auto shrink-0 select-text text-right font-display text-sm font-bold text-accent sm:ml-0 sm:w-24">
                            S/ {(item.price * item.qty).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.slug)}
                        aria-label={`Quitar ${item.name}`}
                        className="shrink-0 self-start text-lg leading-none text-text-muted transition hover:text-red-600 sm:self-center"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="h-fit border border-border bg-surface p-5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  Resumen
                </p>
                <div className="mt-3 flex justify-between border-b border-dashed border-border pb-3 text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="select-text font-medium">
                    S/ {totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-base">
                  <span className="font-display font-bold">Total</span>
                  <span className="select-text font-display font-bold text-accent">
                    S/ {totalPrice.toFixed(2)}
                  </span>
                </div>

                <Link
                  href="/carrito/checkout"
                  className="mt-5 block w-full border border-accent bg-accent py-3 text-center text-sm font-medium text-white transition hover:bg-accent-dark"
                >
                  Continuar al pago
                </Link>

                <div className="mt-4 flex items-center gap-2.5 border-t border-dashed border-border pt-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    Pagas con
                  </span>
                  <Image src={yapeBadge} alt="Yape" width={24} height={24} className="h-6 w-6" />
                  <Image src={plinBadge} alt="Plin" width={24} height={24} className="h-6 w-6" />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
