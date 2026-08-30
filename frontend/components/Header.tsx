"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useCategories } from "@/lib/admin-store";
import logoMark from "@/src/img/logo-mark.png";

export default function Header() {
  const { totalItems } = useCart();
  const categories = useCategories();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
      <div className="border-b border-border bg-accent">
        <div className="mx-auto max-w-7xl px-4 py-1.5 text-center font-mono text-[11px] tracking-wide text-white sm:px-6">
          Envio a todo el Perú por compras mayores a S/150
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:gap-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={logoMark}
            alt="ElectroStock Perú"
            width={36}
            height={36}
            loading="eager"
            className="h-9 w-9"
          />
          <span className="font-display text-lg font-bold uppercase tracking-tight">
            ElectroStock <span className="text-accent">Perú</span>
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
            href="/cuenta"
            className="hidden items-center gap-1.5 text-sm font-medium text-text-muted transition hover:text-accent sm:inline-flex"
          >
            <User className="h-4 w-4" strokeWidth={1.75} />
            Iniciar sesión
          </Link>
          <Link
            href="/carrito"
            className="inline-flex items-center gap-1.5 border border-accent bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
            Carrito ({totalItems})
          </Link>
        </div>
      </div>
    </header>
  );
}
