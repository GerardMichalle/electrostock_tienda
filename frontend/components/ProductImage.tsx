import { Cpu } from "lucide-react";

const gridPattern =
  "linear-gradient(var(--color-border) 1px, transparent 1px)," +
  "linear-gradient(90deg, var(--color-border) 1px, transparent 1px)";

export default function ProductImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const isRealImage =
    src.startsWith("data:image") ||
    src.startsWith("http") ||
    src.startsWith("/");

  if (isRealImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />;
  }

  // Marcador temporal mientras no hay foto real cargada.
  return (
    <div
      aria-label={alt}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-surface p-4 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ backgroundImage: gridPattern, backgroundSize: "16px 16px" }}
      />
      <div className="relative flex flex-col items-center gap-2 text-center">
        <span className="flex h-10 w-10 items-center justify-center border border-border bg-bg text-accent">
          <Cpu className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <span className="line-clamp-2 font-display text-xs font-semibold text-text-muted">
          {alt}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted/70">
          Foto de referencia
        </span>
      </div>
    </div>
  );
}
