import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/data";
import sensoresImg from "@/src/img/sensores.jpg";
import actuadoresImg from "@/src/img/actuadores.jpg";
import controladoresImg from "@/src/img/microcontrollers.jpg";

const images: Record<string, StaticImageData> = {
  sensores: sensoresImg,
  actuadores: actuadoresImg,
  controladores: controladoresImg,
};

// Categorías que se muestran en la grilla "Categorías principales" de la home
// (las que tienen foto). El resto del catálogo se ve desde el menú "Categorías".
export const FEATURED_CATEGORY_SLUGS = Object.keys(images);

export default function CategoryCard({ category }: { category: Category }) {
  const image = images[category.slug];

  return (
    <Link
      href={`/${category.slug}`}
      className="corner-marks group flex flex-col overflow-hidden border border-border bg-bg transition hover:border-accent hover:shadow-md"
    >
      <span className="cm-tr" />
      <span className="cm-br" />

      <div className="relative aspect-16/10 overflow-hidden border-b border-border bg-surface">
        {image && (
          <Image
            src={image}
            alt={category.name}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            placeholder="blur"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold">{category.name}</h3>
        <p className="mt-1 text-sm text-text-muted">{category.description}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-accent">
          Ver catálogo
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
