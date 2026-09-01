"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Rotate3d, X } from "lucide-react";
import impresora from "@/src/img/impresora_3d.jpg";
import Printed3DViewer from "@/components/Printed3DViewer";

const TRABAJOS = [
  "Cajas y carcasas a medida para tus placas y proyectos",
  "Soportes, bases y montajes para sensores y motores",
  "Engranajes, poleas y piezas mecánicas",
  "Prototipos funcionales y repuestos difíciles de conseguir",
  "Piezas decorativas, maquetas y material didáctico",
];

export default function Impresiones3D() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <h2 className="font-display text-2xl font-semibold">Impresiones 3D</h2>
      <p className="mt-2 max-w-xl text-sm text-text-muted">
        No solo vendemos componentes: también fabricamos piezas con impresión 3D
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Imagen + botón */}
        <div>
          <div className="overflow-hidden border border-border bg-surface">
            <Image
              src={impresora}
              alt="Impresora 3D de AMYTRONICS imprimiendo una pieza"
              sizes="(min-width: 1024px) 560px, 100vw"
              className="h-auto w-full object-cover"
              placeholder="blur"
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-accent bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-dark sm:w-auto"
          >
            <Rotate3d className="h-4 w-4" strokeWidth={1.75} />
            Ver ejemplo interactivo
          </button>
        </div>

        {/* Información */}
        <div className="text-sm leading-relaxed text-text-muted">
          <p>
            Una impresora 3D construye objetos reales{" "}
            <span className="text-text">capa por capa</span> a partir de un
            archivo digital. Tú nos envías la idea, el plano o el modelo (STL /
            STEP) y nosotros lo fabricamos en plástico resistente PLA, PETG,
            ABS con la resistencia y el acabado que tu proyecto necesite.
          </p>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Qué podemos fabricar
          </p>
          <ul className="mt-2 space-y-1.5">
            {TRABAJOS.map((t) => (
              <li
                key={t}
                className="pl-4 -indent-4 before:mr-2 before:text-accent before:content-['▸']"
              >
                {t}
              </li>
            ))}
          </ul>

          <p className="mt-4">
            ¿Tienes una pieza en mente?{" "}
            <span className="text-text">
              Escríbenos con tu archivo o una foto y te damos presupuesto.
            </span>
          </p>
        </div>
      </div>

      {open && <ViewerModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ViewerModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ejemplo interactivo de impresión 3D"
    >
      <div
        className="relative my-auto w-full max-w-2xl border border-border bg-bg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center border border-border bg-bg/80 text-text-muted transition hover:border-accent hover:text-accent"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="p-5 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Ejemplo interactivo
          </p>
          <h3 className="mt-1 font-display text-lg font-bold">
            Engranaje impreso en 3D
          </h3>

          <div
            className="mt-4 aspect-square w-full overflow-hidden border border-border sm:aspect-[4/3]"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, #16233b 0%, #0b1220 70%)",
            }}
          >
            <Printed3DViewer />
          </div>

          <p className="mt-3 text-center text-xs text-text-muted">
            Arrastra para girar · usa la rueda para acercar. Se genera en tu
            navegador, sin descargas.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
