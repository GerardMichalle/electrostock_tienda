"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";

/**
 * Aviso de cookies que aparece al entrar al sitio. AMYTRONICS solo usa
 * almacenamiento técnico propio (sin publicidad ni terceros), así que el aviso
 * es informativo: un botón "Aceptar" que lo recuerda para no volver a mostrarlo.
 * No se muestra en el panel (/admin).
 */
const KEY = "amytronics_cookie_consent";

function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function CookieConsent() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [accepted, setAccepted] = useState(false);

  if (!hydrated || accepted) return null;
  if (pathname?.startsWith("/admin")) return null;

  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(KEY);
  } catch {
    // almacenamiento no disponible: mostramos el aviso igual (no rompe nada)
  }
  if (stored) return null;

  function accept() {
    try {
      window.localStorage.setItem(KEY, "accepted");
    } catch {
      /* sin almacenamiento: igual ocultamos el aviso en esta sesión */
    }
    setAccepted(true);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-6">
        <Cookie
          className="hidden h-6 w-6 shrink-0 text-accent sm:block"
          strokeWidth={1.75}
        />
        <p className="flex-1 text-xs leading-relaxed text-text-muted sm:text-[13px]">
          Usamos almacenamiento técnico propio para que el carrito y tu sesión
          funcionen. <strong className="text-text">No</strong> usamos cookies de
          publicidad ni rastreadores de terceros.{" "}
          <Link
            href="/politica-de-cookies"
            className="font-medium text-accent transition hover:underline"
          >
            Más información
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 self-start border border-accent bg-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-accent-dark sm:self-auto"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
