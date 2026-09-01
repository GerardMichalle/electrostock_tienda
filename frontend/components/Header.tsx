"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useFlyToCart } from "@/lib/fly-to-cart";
import { useCategories } from "@/lib/admin-store";
import AnnouncementBar from "@/components/AnnouncementBar";
import logoMark from "@/src/img/logo-mark.png";

export default function Header() {
  const { totalItems } = useCart();
  const { setCartTarget, arrivals } = useFlyToCart();
  const categories = useCategories();

  const cartRef = useRef<HTMLAnchorElement>(null);
  const [bumping, setBumping] = useState(false);
  const firstArrival = useRef(true);

  useEffect(() => {
    setCartTarget(cartRef.current);
    return () => setCartTarget(null);
  }, [setCartTarget]);

  useEffect(() => {
    if (firstArrival.current) {
      firstArrival.current = false;
      return;
    }
    setBumping(true);
    const id = setTimeout(() => setBumping(false), 480);
    return () => clearTimeout(id);
  }, [arrivals]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
      <AnnouncementBar />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:gap-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={logoMark}
            alt="AMYTRONICS"
            width={36}
            height={36}
            loading="eager"
            className="h-9 w-9"
          />
          <span className="font-display text-lg font-bold uppercase tracking-tight">
            Amy<span className="text-accent">tronics</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {categories.map((cat) => (
            <div key={cat.slug} className="group relative">
              <button className="rounded-sm px-3 py-2 text-sm font-medium text-text transition hover:text-accent">
                {cat.name}
              </button>
              <div className="absolute left-0 top-full hidden w-64 border border-border bg-bg p-2 shadow-lg group-hover:block">
                {cat.subcategories.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/${cat.slug}/${sub.slug}`}
                    className="block rounded-sm px-3 py-2 text-sm text-text-muted transition hover:bg-surface hover:text-accent"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            ref={cartRef}
            href="/carrito"
            className={`inline-flex items-center gap-1.5 border border-accent bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-dark ${
              bumping ? "cart-bump" : ""
            }`}
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
            <span>
              Carrito{" "}
              <span key={totalItems} className="cart-count inline-block">
                ({totalItems})
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
