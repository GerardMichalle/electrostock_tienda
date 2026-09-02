"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import { useCategories } from "@/lib/admin-store";

/**
 * Menú desplegable de categorías del Header. Un botón "Categorías" abre una
 * lista vertical con todas; cada categoría con subcategorías tiene una flecha
 * para desplegarlas. Funciona igual en escritorio y móvil (el panel se adapta
 * al ancho). Los datos vienen de la API (`useCategories`), así que lo que el
 * cliente edita en el panel se refleja al instante.
 */
export default function CategoriesNav() {
  const categories = useCategories();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setExpanded(null);
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-2 border border-accent bg-accent px-2.5 py-2 text-sm font-medium text-white transition hover:bg-accent-dark sm:px-3"
      >
        <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span className="hidden sm:inline">Categorías</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-[75vh] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto border border-border bg-bg shadow-xl">
          {categories.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-text-muted">
              Cargando categorías…
            </p>
          ) : (
            <ul className="py-1">
              {categories.map((cat) => {
                // Solo mostramos la flecha si hay subcategorías reales que
                // valga la pena desplegar (más de una). Una sola subcategoría
                // lleva a los mismos productos que la categoría.
                const hasSubs = cat.subcategories.length > 1;
                const isExpanded = expanded === cat.slug;
                return (
                  <li
                    key={cat.slug}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <div className="flex items-stretch">
                      <Link
                        href={`/${cat.slug}`}
                        onClick={close}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-text transition hover:bg-surface hover:text-accent"
                      >
                        {cat.name}
                      </Link>
                      {hasSubs && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded(isExpanded ? null : cat.slug)
                          }
                          aria-label={`Ver subcategorías de ${cat.name}`}
                          aria-expanded={isExpanded}
                          className="flex w-10 shrink-0 items-center justify-center border-l border-border/60 text-text-muted transition hover:bg-surface hover:text-accent"
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                            strokeWidth={2}
                          />
                        </button>
                      )}
                    </div>

                    {hasSubs && isExpanded && (
                      <ul className="bg-surface/50 pb-1">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={`/${cat.slug}/${sub.slug}`}
                              onClick={close}
                              className="block py-2 pl-8 pr-4 text-sm text-text-muted transition hover:text-accent"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
