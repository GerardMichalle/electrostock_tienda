"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Cpu } from "lucide-react";

// Efecto "volar al carrito": al añadir un producto, un clon de su imagen sale
// del origen, describe un arco por la pantalla y se encoge dentro del botón del
// carrito del header. El alta real en el carrito (`onArrive`) se ejecuta cuando
// el clon aterriza, así el contador sube justo con el impacto, no al hacer clic.

type FlyOptions = {
  /** Elemento de origen; se usa su posición actual en pantalla. */
  origin: HTMLElement | null;
  /** URL de la foto del producto; si no es una foto real se muestra un marcador. */
  image?: string;
  /** Se ejecuta cuando el clon llega al carrito (aquí va el addItem real). */
  onArrive?: () => void;
};

type FlyToCartValue = {
  flyToCart: (opts: FlyOptions) => void;
  setCartTarget: (el: HTMLElement | null) => void;
  /** Se incrementa cada vez que un vuelo aterriza; el badge lo observa. */
  arrivals: number;
};

const FlyToCartContext = createContext<FlyToCartValue | null>(null);

const REAL_IMAGE = /^(https?:\/\/|data:image|\/)/;
const MAX_GHOSTS = 12;

type Ghost = {
  id: number;
  image?: string;
  from: { x: number; y: number; size: number };
  to: { x: number; y: number };
  onArrive?: () => void;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const targetRef = useRef<HTMLElement | null>(null);
  const idRef = useRef(0);
  const [arrivals, setArrivals] = useState(0);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);

  const setCartTarget = useCallback((el: HTMLElement | null) => {
    targetRef.current = el;
  }, []);

  const landed = useCallback((id: number, onArrive?: () => void) => {
    onArrive?.();
    setArrivals((n) => n + 1);
    setGhosts((list) => list.filter((g) => g.id !== id));
  }, []);

  const flyToCart = useCallback(
    ({ origin, image, onArrive }: FlyOptions) => {
      const target = targetRef.current;

      // Sin origen/destino o con reduced-motion: alta inmediata, sin vuelo.
      if (!origin || !target || prefersReducedMotion()) {
        onArrive?.();
        if (target) setArrivals((n) => n + 1);
        return;
      }

      const o = origin.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      if (o.width === 0 && o.height === 0) {
        onArrive?.();
        setArrivals((n) => n + 1);
        return;
      }

      const size = Math.min(Math.max(Math.min(o.width, o.height), 56), 92);
      const ghost: Ghost = {
        id: idRef.current++,
        image,
        from: { x: o.left + o.width / 2, y: o.top + o.height / 2, size },
        to: { x: t.left + t.width / 2, y: t.top + t.height / 2 },
        onArrive,
      };
      // Tope de vuelos simultáneos como red de seguridad; solo se alcanzaría
      // con decenas de clics en menos de un segundo.
      setGhosts((list) => [...list, ghost].slice(-MAX_GHOSTS));
    },
    [],
  );

  return (
    <FlyToCartContext.Provider value={{ flyToCart, setCartTarget, arrivals }}>
      {children}
      {ghosts.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div aria-hidden className="pointer-events-none fixed inset-0 z-9999">
            {ghosts.map((ghost) => (
              <FlyingGhost key={ghost.id} ghost={ghost} onLand={landed} />
            ))}
          </div>,
          document.body,
        )}
    </FlyToCartContext.Provider>
  );
}

function FlyingGhost({
  ghost,
  onLand,
}: {
  ghost: Ghost;
  onLand: (id: number, onArrive?: () => void) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const el = ref.current;
    if (!el) {
      onLand(ghost.id, ghost.onArrive);
      return;
    }

    const dx = ghost.to.x - ghost.from.x;
    const dy = ghost.to.y - ghost.from.y;
    // Altura del arco: proporcional al recorrido horizontal, con tope.
    const lift = Math.min(220, Math.abs(dx) * 0.4 + 90);

    const anim = el.animate(
      [
        {
          offset: 0,
          transform:
            "translate(-50%, -50%) translate(0px, 0px) scale(1) rotate(0deg)",
          opacity: 1,
          easing: "cubic-bezier(.34, .02, .74, .2)",
        },
        {
          offset: 0.55,
          transform: `translate(-50%, -50%) translate(${dx * 0.5}px, ${
            dy * 0.5 - lift
          }px) scale(.82) rotate(-9deg)`,
          opacity: 1,
          easing: "cubic-bezier(.3, .7, .3, 1)",
        },
        {
          offset: 1,
          transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(.16) rotate(8deg)`,
          opacity: 0.3,
        },
      ],
      { duration: 760, fill: "forwards" },
    );

    const finish = () => onLand(ghost.id, ghost.onArrive);
    anim.addEventListener("finish", finish);
    anim.addEventListener("cancel", finish);
    // No cancelamos en cleanup: el provider vive en el layout y no se desmonta,
    // así el vuelo siempre termina y dispara el alta en el carrito.
  }, [ghost, onLand]);

  const real = ghost.image && REAL_IMAGE.test(ghost.image);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left: ghost.from.x,
        top: ghost.from.y,
        width: ghost.from.size,
        height: ghost.from.size,
        willChange: "transform, opacity",
      }}
      className="flex items-center justify-center overflow-hidden border border-accent bg-bg shadow-[0_12px_30px_-8px_rgba(21,84,179,.55)]"
    >
      {real ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ghost.image}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <Cpu className="h-1/2 w-1/2 text-accent" strokeWidth={1.75} />
      )}
    </div>
  );
}

export function useFlyToCart() {
  const ctx = useContext(FlyToCartContext);
  if (!ctx)
    throw new Error("useFlyToCart debe usarse dentro de <FlyToCartProvider>");
  return ctx;
}
