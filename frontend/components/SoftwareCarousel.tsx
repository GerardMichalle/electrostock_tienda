"use client";

import { useCallback, useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import autocadLogo from "@/src/img/autocad.png";
import matlabLogo from "@/src/img/matlab.png";
import solidworksLogo from "@/src/img/solidworks.jpg";

type Tool = {
  name: string;
  tag: string;
  description: string;
  logo: StaticImageData;
};

const tools: Tool[] = [
  {
    name: "AutoCAD",
    tag: "Diseño CAD 2D/3D",
    description:
      "El estándar de la industria para dibujo técnico. Ideal para esquemas eléctricos, layouts de tableros y planos de tus proyectos con precisión milimétrica.",
    logo: autocadLogo,
  },
  {
    name: "MATLAB",
    tag: "Cálculo y simulación",
    description:
      "Cómputo numérico para procesamiento de señales, control de sistemas y análisis de datos de sensores. Con Simulink modelas y simulas circuitos y sistemas embebidos.",
    logo: matlabLogo,
  },
  {
    name: "SolidWorks",
    tag: "Modelado mecánico 3D",
    description:
      "CAD 3D paramétrico para diseñar carcasas, soportes y piezas a la medida de tus placas y sensores, listas para imprimir en 3D o mandar a fabricar.",
    logo: solidworksLogo,
  },
];

const INTERVAL = 3500;

export default function SoftwareCarousel() {
  const count = tools.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(id);
  }, [paused, count]);

  return (
    <div
      className="corner-marks relative overflow-hidden border border-border bg-bg"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Software de ingeniería electrónica"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
    >
      <span className="cm-tr" />
      <span className="cm-br" />

      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {tools.map((tool, i) => (
          <div
            key={tool.name}
            aria-hidden={i !== index}
            className="grid w-full shrink-0 items-center gap-6 p-6 sm:grid-cols-[210px_1fr] sm:gap-10 sm:p-10"
          >
            <div className="mx-auto flex aspect-4/3 w-full max-w-[240px] items-center justify-center border border-border bg-white p-5 sm:mx-0 sm:max-w-none">
              <Image
                src={tool.logo}
                alt={tool.name}
                sizes="210px"
                className="max-h-full w-auto object-contain"
              />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                {tool.tag}
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold">{tool.name}</h3>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-text-muted">
                {tool.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Programa anterior"
          className="flex h-8 w-8 items-center justify-center border border-border text-text-muted transition hover:border-accent hover:text-accent"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="flex items-center gap-2">
          {tools.map((tool, i) => (
            <button
              key={tool.name}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ver ${tool.name}`}
              aria-current={i === index}
              className={`h-1.5 transition-all ${
                i === index ? "w-6 bg-accent" : "w-3 bg-border hover:bg-text-muted"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Programa siguiente"
          className="flex h-8 w-8 items-center justify-center border border-border text-text-muted transition hover:border-accent hover:text-accent"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
