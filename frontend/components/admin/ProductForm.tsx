"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Product } from "@/lib/data";
import { slugify, useCategories } from "@/lib/admin-store";
import ProductImage from "@/components/ProductImage";

type FormMode = "create" | "edit";

export default function ProductForm({
  mode,
  initialProduct,
  onSubmit,
  onDelete,
}: {
  mode: FormMode;
  initialProduct?: Product;
  onSubmit: (product: Product) => void;
  onDelete?: () => void;
}) {
  const router = useRouter();
  const categories = useCategories();

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [sku, setSku] = useState(initialProduct?.sku ?? "");
  const [price, setPrice] = useState(initialProduct?.price?.toString() ?? "");
  const [categorySlug, setCategorySlug] = useState(
    initialProduct?.categorySlug ?? categories[0]?.slug ?? ""
  );
  const [subcategorySlug, setSubcategorySlug] = useState(
    initialProduct?.subcategorySlug ??
      categories[0]?.subcategories[0]?.slug ??
      ""
  );
  const [stock, setStock] = useState<Product["stock"]>(
    initialProduct?.stock ?? "En stock"
  );
  const [spec, setSpec] = useState(initialProduct?.spec ?? "");
  const [description, setDescription] = useState(
    initialProduct?.description ?? ""
  );
  const [gallery, setGallery] = useState<string[]>(initialProduct?.gallery ?? []);
  const [videoUrl, setVideoUrl] = useState(initialProduct?.videoUrl ?? "");
  const [error, setError] = useState("");

  const activeCategory =
    categories.find((c) => c.slug === categorySlug) ?? categories[0];

  function handleCategoryChange(slug: string) {
    setCategorySlug(slug);
    const cat = categories.find((c) => c.slug === slug);
    setSubcategorySlug(cat?.subcategories[0]?.slug ?? "");
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setGallery((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !sku.trim() || !price) {
      setError("Completa al menos nombre, SKU y precio.");
      return;
    }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("El precio debe ser un número válido.");
      return;
    }
    if (gallery.length === 0) {
      setError("Sube al menos una foto del producto.");
      return;
    }
    if (!subcategorySlug) {
      setError(
        "Esta categoría no tiene subcategorías. Crea una en la sección Categorías antes de publicar aquí.",
      );
      return;
    }

    const slug = initialProduct?.slug ?? slugify(`${name}-${sku}`);

    onSubmit({
      slug,
      name: name.trim(),
      sku: sku.trim(),
      price: priceNum,
      categorySlug,
      subcategorySlug,
      stock,
      spec: spec.trim(),
      description: description.trim(),
      image: gallery[0],
      gallery,
      videoUrl: videoUrl.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Nombre del producto
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sensor Ultrasónico HC-SR04"
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            SKU
          </label>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SEN-0104"
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Precio (S/)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="12.00"
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Categoría
          </label>
          <select
            value={categorySlug}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Subcategoría
          </label>
          <select
            value={subcategorySlug}
            onChange={(e) => setSubcategorySlug(e.target.value)}
            disabled={!activeCategory?.subcategories.length}
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent disabled:cursor-not-allowed disabled:text-text-muted"
          >
            {activeCategory?.subcategories.length ? (
              activeCategory.subcategories.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))
            ) : (
              <option value="">Sin subcategorías — créalas primero</option>
            )}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Estado de stock
          </label>
          <div className="flex gap-2">
            {(["En stock", "Bajo pedido", "Agotado"] as const).map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setStock(s)}
                className={`border px-3 py-1.5 text-sm transition ${
                  stock === s
                    ? "border-accent bg-accent text-white"
                    : "border-border text-text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Especificaciones (línea corta, ej: 2cm–400cm · 5V · Trigger/Echo)
          </label>
          <input
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            placeholder="2cm–400cm · 5V · Trigger/Echo"
            className="w-full border border-border bg-bg px-3 py-2 font-mono text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe el producto, sus usos y datos importantes para el cliente."
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Fotos del producto
          </label>
          <div className="flex flex-wrap gap-3">
            {gallery.map((img, i) => (
              <div
                key={i}
                className="relative h-20 w-20 overflow-hidden border border-border bg-surface"
              >
                <ProductImage src={img} alt={`Foto ${i + 1}`} />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label={`Quitar foto ${i + 1}`}
                  className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-bg/90 text-xs text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center border border-dashed border-border text-center font-mono text-[10px] text-text-muted transition hover:border-accent hover:text-accent">
              + Subir
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          </div>
          <p className="mt-1 font-mono text-[11px] text-text-muted">
            La primera foto se usa como imagen principal.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Video (URL de YouTube o Vimeo, opcional)
          </label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
        >
          {mode === "create" ? "Publicar producto" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/productos")}
          className="border border-border px-5 py-2.5 text-sm font-medium text-text-muted transition hover:border-accent hover:text-accent"
        >
          Cancelar
        </button>

        {mode === "edit" && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:border-red-400"
          >
            Eliminar producto
          </button>
        )}
      </div>
    </form>
  );
}
