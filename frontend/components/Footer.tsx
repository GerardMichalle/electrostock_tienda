"use client";

import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/lib/admin-store";
import logoFull from "@/src/img/logo-full.png";
import yapeLogo from "@/src/img/yape-badge.png";
import plinLogo from "@/src/img/plin-badge.png";
import libroReclamaciones from "@/src/img/libro_reclamaciones.png";

export default function Footer() {
  const categories = useCategories();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Image
            src={logoFull}
            alt="AMYTRONICS — conecta, crea, innova"
            sizes="256px"
            className="h-auto w-64"
          />
          <p className="mt-3 text-sm text-text-muted">
            Componentes de electrónica y robótica para tus proyectos, con
            despacho a todo el Perú.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-text">
            Catálogo
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-text-muted">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/${cat.slug}`}
                  className="transition hover:text-accent"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-text">
            Ayuda
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-text-muted">
            <li>Contáctanos</li>
            <li>Envíos y entregas</li>
            <li>Métodos de pago</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-text">
            Pagas con
          </h4>
          <div className="mt-3 inline-flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <Image src={yapeLogo} alt="Yape" width={40} height={40} className="h-10 w-10" />
              <Image src={plinLogo} alt="Plin" width={40} height={40} className="h-10 w-10" />
            </div>
            <button
              type="button"
              aria-label="Libro de reclamaciones"
              className="cursor-pointer transition hover:opacity-80"
            >
              <Image
                src={libroReclamaciones}
                alt="Libro de reclamaciones"
                sizes="96px"
                className="h-auto w-24"
              />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-text-muted sm:px-6">
        © 2026 AMYTRONICS. Todos los derechos reservados.
      </div>
    </footer>
  );
}
