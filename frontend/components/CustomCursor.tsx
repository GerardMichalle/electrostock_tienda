"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Cursor personalizado tipo sonda de osciloscopio: un punto central que sigue
 * al mouse de cerca y un anillo "scanner" con marcas de retícula que lo sigue
 * con retraso suave. Sobre elementos interactivos el anillo crece y se pone
 * verde (LED encendido); al hacer clic dispara una pequeña descarga.
 *
 * Solo se activa en escritorio con puntero fino y si el usuario no pidió
 * "menos movimiento". En móvil / táctil no renderiza nada.
 */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function useCursorEnabled(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const a = window.matchMedia(FINE_POINTER);
      const b = window.matchMedia(REDUCED_MOTION);
      a.addEventListener("change", onChange);
      b.addEventListener("change", onChange);
      return () => {
        a.removeEventListener("change", onChange);
        b.removeEventListener("change", onChange);
      };
    },
    () =>
      window.matchMedia(FINE_POINTER).matches &&
      !window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

export default function CustomCursor() {
  const enabled = useCursorEnabled();
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);

  const layerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("has-custom-cursor");

    // posiciones: t = objetivo (mouse), d = punto, r = anillo
    let tx = -100,
      ty = -100,
      dx = -100,
      dy = -100,
      rx = -100,
      ry = -100;
    let visible = false;
    let raf = 0;
    let sparkId = 0;

    const layer = layerRef.current!;
    const dot = dotRef.current!;
    const ring = ringRef.current!;

    const interactiveSel =
      'a,button,[role="button"],select,label,summary,.cursor-pointer';
    const textSel = 'input,textarea,[contenteditable="true"]';

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        layer.classList.add("is-visible");
      }
      const el = e.target as Element | null;
      const overText = !!el?.closest?.(textSel);
      const overInteractive = !overText && !!el?.closest?.(interactiveSel);
      layer.dataset.hidden = overText ? "true" : "false";
      layer.dataset.active = overInteractive ? "true" : "false";
    };

    const onDown = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (el?.closest?.(textSel)) return;
      const id = sparkId++;
      setSparks((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(
        () => setSparks((prev) => prev.filter((s) => s.id !== id)),
        520,
      );
    };

    const onLeave = () => {
      visible = false;
      layer.classList.remove("is-visible");
    };

    const tick = () => {
      // seguimiento con suavizado (lerp): el punto casi pega al mouse,
      // el anillo va detrás con más inercia.
      dx += (tx - dx) * 0.45;
      dy += (ty - dy) * 0.45;
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={layerRef} className="cursor-layer" aria-hidden>
      <div ref={ringRef} className="cursor-ring">
        <span className="cursor-ring__scan" />
        <span className="cursor-tick cursor-tick--t" />
        <span className="cursor-tick cursor-tick--r" />
        <span className="cursor-tick cursor-tick--b" />
        <span className="cursor-tick cursor-tick--l" />
      </div>
      <div ref={dotRef} className="cursor-dot" />
      {sparks.map((s) => (
        <span
          key={s.id}
          className="cursor-spark"
          style={{ left: s.x, top: s.y }}
        />
      ))}
    </div>
  );
}
