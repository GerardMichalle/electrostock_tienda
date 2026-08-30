import Image from "next/image";
import HeroParticles from "@/components/HeroParticles";
import heroImg from "@/src/img/hero_img.jpg";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Foto real de fondo */}
      <Image
        src={heroImg}
        alt=""
        fill
        preload
        sizes="100vw"
        placeholder="blur"
        className="object-cover object-center"
      />
      {/* Scrim oscuro: fuerte sobre el texto (izq.), suave sobre la tarjeta (der.) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-r from-black/75 via-black/60 to-black/45"
      />
      {/* Campo de partículas tipo circuito: deriva solo y reacciona al cursor */}
      <HeroParticles />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="max-w-2xl">
          <p className="inline-block border border-white/60 px-2 py-1 font-mono text-xs uppercase tracking-[0.15em] text-white">
            Stock actualizado
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white text-shadow-lg sm:text-5xl">
            Los componentes que tu proyecto necesita, listos para armar
          </h1>
          <p className="mt-4 max-w-md text-white text-shadow-sm">
            Sensores, actuadores y controladores en stock, con ficha técnica
            clara y despacho rápido. Paga con Yape o Plin
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href="#categorias"
              className="border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
            >
              Ver catálogo
            </a>
            <a
              href="#novedades"
              className="border border-white/60 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
            >
              Novedades
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
