"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Product } from "@/lib/data";
import { useCategories, type Result } from "@/lib/admin-store";
import { STOCK_TO_API } from "@/lib/adapters";
import ProductImage from "@/components/ProductImage";

type FormMode = "create" | "edit";

export default function ProductForm({
  mode,
  initialProduct,
  onSubmit,
  onDelete,
  onDeleteImage,
}: {
  mode: FormMode;
  initialProduct?: Product;
  onSubmit: (formData: FormData) => Promise<Result>;
  onDelete?: () => void;
  onDeleteImage?: (imageId: string) => Promise<Result>;
}) {
  const router = useRouter();
  const categories = useCategories();

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [sku, setSku] = useState(initialProduct?.sku ?? "");
  const [price, setPrice] = useState(initialProduct?.price?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(
    initialProduct?.categoryId ?? categories[0]?.id ?? "",
  );
  const [subcategoryId, setSubcategoryId] = useState(
    initialProduct?.subcategoryId ?? categories[0]?.subcategories[0]?.id ?? "",
  );
  const [stock, setStock] = useState<Product["stock"]>(
    initialProduct?.stock ?? "En stock",
  );
  const [spec, setSpec] = useState(initialProduct?.spec ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [videoUrl, setVideoUrl] = useState(initialProduct?.videoUrl ?? "");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(
    initialProduct?.images ?? [],
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeCategory =
    categories.find((c) => c.id === categoryId) ?? categories[0];

  function handleCategoryChange(id: string) {
    setCategoryId(id);
    const cat = categories.find((c) => c.id === id);
    setSubcategoryId(cat?.subcategories[0]?.id ?? "");
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    setNewFiles((prev) => [...prev, ...Array.from(files)]);
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function removeExistingImage(imageId: string) {
    if (!onDeleteImage) return;
    if (!confirm("¿Quitar esta foto? No se puede deshacer.")) return;
    const res = await onDeleteImage(imageId);
    if (res.ok) {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } else {
      setError(res.error ?? "No se pudo quitar la foto.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
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
    if (!subcategoryId) {
      setError(
        "Esta categoría no tiene subcategorías. Crea una en la sección Categorías antes de publicar aquí.",
      );
      return;
    }
    const totalPhotos = existingImages.length + newFiles.length;
    if (mode === "create" && newFiles.length === 0) {
      setError("Sube al menos una foto del producto.");
      return;
    }
    if (mode === "edit" && totalPhotos === 0) {
      setError("El producto debe tener al menos una foto.");
      return;
    }

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("sku", sku.trim());
    fd.append("price", price);
    fd.append("categoryId", categoryId);
    fd.append("subcategoryId", subcategoryId);
    fd.append("stock", STOCK_TO_API[stock]);
    fd.append("spec", spec.trim());
    fd.append("description", description.trim());
    if (videoUrl.trim()) fd.append("videoUrl", videoUrl.trim());
    newFiles.forEach((file) => fd.append("images", file));

    setSubmitting(true);
    const res = await onSubmit(fd);
    if (!res.ok) {
      setError(res.error ?? "No se pudo guardar.");
      setSubmitting(false);
    }
    // en éxito, la página padre navega a /admin/productos
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
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
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
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            disabled={!activeCategory?.subcategories.length}
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent disabled:cursor-not-allowed disabled:text-text-muted"
          >
            {activeCategory?.subcategories.length ? (
              activeCategory.subcategories.map((s) => (
                <option key={s.id} value={s.id}>
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
            {existingImages.map((img) => (
              <div
                key={img.id}
                className="relative h-20 w-20 overflow-hidden border border-border bg-surface"
              >
                <ProductImage src={img.url} alt="Foto del producto" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  aria-label="Quitar foto"
                  className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-bg/90 text-xs text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            {newFiles.map((file, i) => (
              <div
                key={`new-${i}`}
                className="relative h-20 w-20 overflow-hidden border border-accent bg-surface"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Nueva foto ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  aria-label={`Quitar nueva foto ${i + 1}`}
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
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <p className="mt-1 font-mono text-[11px] text-text-muted">
            La primera foto se usa como imagen principal. Máximo 8 fotos, 8&nbsp;MB
            cada una.
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
          disabled={submitting}
          className="border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {submitting
            ? "Guardando…"
            : mode === "create"
              ? "Publicar producto"
              : "Guardar cambios"}
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
