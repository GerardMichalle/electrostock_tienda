"use client";

import { useRouter, useParams } from "next/navigation";
import { useAdminProducts } from "@/lib/admin-store";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/data";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { products, ready, updateProduct, deleteProduct } = useAdminProducts();

  const product = products.find((p) => p.slug === params.slug);

  function handleSubmit(updated: Product) {
    updateProduct(params.slug, updated);
    router.push("/admin/productos");
  }

  function handleDelete() {
    if (!product) return;
    if (confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
      deleteProduct(product.slug);
      router.push("/admin/productos");
    }
  }

  if (!ready) {
    return <p className="text-sm text-text-muted">Cargando…</p>;
  }

  if (!product) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold">Producto no encontrado</h1>
        <p className="mt-2 text-sm text-text-muted">
          Puede que ya haya sido eliminado.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Editar producto</h1>
      <p className="mt-1 text-sm text-text-muted">{product.name}</p>

      <div className="mt-6">
        <ProductForm
          mode="edit"
          initialProduct={product}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
