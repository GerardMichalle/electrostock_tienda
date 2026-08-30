export default function ProductImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const isRealImage = src.startsWith("data:image") || src.startsWith("http");

  if (isRealImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />;
  }

  return (
    <span className="font-mono text-xs text-text-muted">[{src || "sin-imagen"}]</span>
  );
}
