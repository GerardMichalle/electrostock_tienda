"use client";

import { useState } from "react";
import ProductImage from "@/components/ProductImage";

export default function ProductGallery({
  gallery,
  videoUrl,
  productName,
}: {
  gallery: string[];
  videoUrl?: string;
  productName: string;
}) {
  const items: { type: "image" | "video"; ref: string }[] = [
    ...gallery.map((g) => ({ type: "image" as const, ref: g })),
    ...(videoUrl ? [{ type: "video" as const, ref: videoUrl }] : []),
  ];
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <div>
      <div className="corner-marks flex aspect-square items-center justify-center border border-border bg-surface">
        <span className="cm-tr" />
        <span className="cm-br" />
        {current.type === "video" ? (
          <iframe
            src={current.ref}
            title={`Video de ${productName}`}
            className="h-full w-full"
            allowFullScreen
          />
        ) : (
          <ProductImage src={current.ref} alt={productName} />
        )}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={
              item.type === "video" ? "Ver video del producto" : `Ver foto ${i + 1}`
            }
            className={`flex h-16 w-16 shrink-0 items-center justify-center border bg-surface font-mono text-[10px] text-text-muted transition ${
              i === active ? "border-accent" : "border-border hover:border-text-muted"
            }`}
          >
            {item.type === "video" ? "▶ video" : `[${i + 1}]`}
          </button>
        ))}
      </div>
    </div>
  );
}
