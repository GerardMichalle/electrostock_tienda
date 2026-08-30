"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminProducts } from "@/lib/admin-store";
import ProductImage from "@/components/ProductImage";

const stockStyles: Record<string, string> = {
  "En stock": "bg-accent-cyan/10 text-sky-700",
  Agotado: "bg-surface text-text-muted",
  "Bajo pedido": "bg-amber-50 text-amber-700",
};

export default function AdminProductsPage() {
  const { products, ready, deleteProduct } = useAdminProducts();
  const [query, setQuery] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase())
  );

  function handleDelete(slug: string, name: string) {
    if (confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      deleteProduct(slug);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Productos</h1>
          <p className="mt-1 text-sm text-text-muted">
            {ready ? `${products.length} productos publicados` : "Cargando…"}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="border border-accent bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
        >
          + Nuevo producto
        </Link>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o SKU…"
        className="mt-5 w-full max-w-sm border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
      />

      <div className="mt-5 overflow-x-auto border border-border bg-bg">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface font-mono text-[11px] uppercase tracking-wider text-text-muted">
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!ready && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  Cargando…
                </td>
              </tr>
            )}
            {ready && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No se encontraron productos.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.slug} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="h-12 w-12 overflow-hidden border border-border bg-surface">
                    <ProductImage src={p.image} alt={p.name} />
                  </div>
                </td>
                <td className="select-text px-4 py-3 font-medium">{p.name}</td>
                <td className="select-text px-4 py-3 font-mono text-xs text-text-muted">
                  {p.sku}
                </td>
                <td className="select-text px-4 py-3 font-medium text-accent">
                  S/ {p.price.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 text-[11px] font-medium ${stockStyles[p.stock]}`}
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/productos/${p.slug}/editar`}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(p.slug, p.name)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
