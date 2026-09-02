"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useFlyToCart } from "@/lib/fly-to-cart";
import AnnouncementBar from "@/components/AnnouncementBar";
import CategoriesNav from "@/components/CategoriesNav";
import logoMark from "@/src/img/logo-mark.png";

const QUICK_LINKS = [
  { label: "Novedades", href: "/#novedades" },
  { label: "Ofertas", href: "/#ofertas" },
  { label: "Impresión 3D", href: "/#impresiones-3d" },
];

export default function Header() {
  const { totalItems } = useCart();
  const { setCartTarget, arrivals } = useFlyToCart();
  const pathname = usePathname();

  // En la home, los enlaces con ancla bajan con scroll suave en vez de saltar.
  function handleAnchorClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    const hash = href.split("#")[1];
    if (!hash || pathname !== "/") return;
    const el = document.getElementById(hash);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${hash}`);
  }

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

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:gap-6 sm:px-6">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <CategoriesNav />

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
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleAnchorClick(e, item.href)}
              className="rounded-sm px-3 py-2 text-sm font-medium text-text transition hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
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
