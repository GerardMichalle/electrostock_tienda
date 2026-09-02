"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUp, Send, X } from "lucide-react";
import logoMark from "@/src/img/logo-mark.png";

/**
 * Botones flotantes de la tienda (esquina inferior derecha):
 *  - WhatsApp: al pulsar abre una mini ventana de chat donde el visitante deja
 *    su nombre y su mensaje; al enviar se abre WhatsApp con todo ya escrito.
 *  - "Volver arriba": aparece al bajar la página, con un anillo que marca el
 *    progreso de scroll.
 *
 * No se muestra en el panel (`/admin`). Respeta `prefers-reduced-motion`.
 */

// Número del negocio en formato internacional, sin "+" ni espacios.
// Se puede sobrescribir con NEXT_PUBLIC_WHATSAPP_NUMBER en Vercel sin tocar código.
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "51934665410";

const NAME_KEY = "amytronics_wa_name";
const SHOW_TOP_AFTER = 360; // px de scroll antes de mostrar la flecha
const RING_R = 20;
const RING_C = 2 * Math.PI * RING_R;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(REDUCED_MOTION);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

function useScrolledPast(threshold: number): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      window.addEventListener("resize", onChange);
      return () => {
        window.removeEventListener("scroll", onChange);
        window.removeEventListener("resize", onChange);
      };
    },
    () => window.scrollY > threshold,
    () => false,
  );
}

function buildWaHref(name: string, message: string): string {
  const n = name.trim();
  const m = message.trim();
  const text = [
    n ? `Hola AMYTRONICS, soy ${n}.` : "Hola AMYTRONICS 👋",
    m || "Quería hacer una consulta sobre sus productos.",
  ].join("\n\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export default function FloatingActions() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const showTop = useScrolledPast(SHOW_TOP_AFTER);
  const ringRef = useRef<SVGCircleElement>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function openChat() {
    if (!name) {
      try {
        const saved = localStorage.getItem(NAME_KEY);
        if (saved) setName(saved);
      } catch {
        /* almacenamiento no disponible */
      }
    }
    setChatOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (name.trim()) localStorage.setItem(NAME_KEY, name.trim());
    } catch {
      /* almacenamiento no disponible */
    }
    window.open(buildWaHref(name, message), "_blank", "noopener,noreferrer");
    setChatOpen(false);
    setMessage("");
  }

  // Enfoca el campo de nombre al abrir el chat.
  useEffect(() => {
    if (chatOpen) nameRef.current?.focus();
  }, [chatOpen]);

  // Cerrar con Escape o clic fuera.
  useEffect(() => {
    if (!chatOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setChatOpen(false);
    }
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (
        !panelRef.current?.contains(t) &&
        !triggerRef.current?.contains(t)
      ) {
        setChatOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [chatOpen]);

  // Anillo de progreso de scroll, actualizado por rAF fuera de React.
  useEffect(() => {
    if (!showTop || chatOpen) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const el = ringRef.current;
      if (!el) return;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      el.style.strokeDashoffset = String(RING_C * (1 - progress));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [showTop, chatOpen]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* ---- Volver arriba ---- */}
      <button
        type="button"
        aria-label="Volver arriba"
        onClick={() =>
          window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
        }
        data-visible={showTop && !chatOpen}
        className="group fixed bottom-[5.25rem] right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-border bg-bg/85 text-accent shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 data-[visible=false]:pointer-events-none data-[visible=false]:translate-y-3 data-[visible=false]:opacity-0 sm:bottom-[6.75rem] sm:right-6"
      >
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 44 44"
          aria-hidden="true"
        >
          <circle
            cx="22"
            cy="22"
            r={RING_R}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.16"
            strokeWidth="2"
          />
          <circle
            ref={ringRef}
            cx="22"
            cy="22"
            r={RING_R}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C}
            style={{ transition: "stroke-dashoffset 120ms linear" }}
          />
        </svg>
        <ArrowUp
          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
          strokeWidth={2.5}
        />
      </button>

      {/* ---- WhatsApp + panel de chat ---- */}
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        {chatOpen && (
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Chat con AMYTRONICS"
            className="absolute bottom-full right-0 mb-3 w-80 max-w-[calc(100vw-2rem)] origin-bottom-right overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl motion-safe:animate-[wa-pop_180ms_ease-out]"
          >
            {/* Cabecera */}
            <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
              <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white">
                <Image
                  src={logoMark}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#075E54] bg-[#25D366]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">AMYTRONICS</p>
                <p className="text-[11px] leading-tight text-white/75">
                  Normalmente responde en pocos minutos
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="Cerrar chat"
                className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Burbuja de bienvenida */}
            <div className="bg-[#ECE5DD] px-4 py-4">
              <div className="max-w-[88%] rounded-lg rounded-tl-sm bg-white px-3 py-2 text-[13px] leading-snug text-text shadow-sm">
                👋 ¡Hola! Déjanos tu nombre y tu mensaje y seguimos la
                conversación por WhatsApp.
              </div>
            </div>

            {/* Formulario */}
            <form
              onSubmit={handleSubmit}
              className="space-y-2 border-t border-border bg-bg p-3"
            >
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="Tu nombre"
                className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none transition focus:border-accent"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={600}
                rows={3}
                placeholder="¿En qué podemos ayudarte?"
                className="w-full resize-none border border-border bg-bg px-3 py-2 text-sm outline-none transition focus:border-accent"
              />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98]"
              >
                <Send className="h-4 w-4" strokeWidth={2.25} />
                Iniciar chat
              </button>
              <p className="text-center text-[11px] text-text-muted">
                Se abrirá WhatsApp para enviar tu mensaje.
              </p>
            </form>
          </div>
        )}

        {/* Botón */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (chatOpen ? setChatOpen(false) : openChat())}
          aria-expanded={chatOpen}
          aria-label={chatOpen ? "Cerrar chat de WhatsApp" : "Abrir chat de WhatsApp"}
          className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          {!reduced && !chatOpen && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping" />
          )}
          {chatOpen ? (
            <X className="relative h-6 w-6" strokeWidth={2.5} />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="relative h-7 w-7"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
