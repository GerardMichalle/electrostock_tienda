"use client";

import { useRouter, useParams } from "next/navigation";
import { useAdminProducts } from "@/lib/admin-store";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { products, ready, error, updateProduct, deleteProduct, deleteProductImage } =
    useAdminProducts();

  const product = products.find((p) => p.slug === params.slug);

  async function handleSubmit(formData: FormData) {
    if (!product?.id) return { ok: false, error: "Producto no encontrado." };
    const res = await updateProduct(product.id, formData);
    if (res.ok) router.push("/admin/productos");
    return res;
  }

  async function handleDelete() {
    if (!product?.id) return;
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`))
      return;
    const res = await deleteProduct(product.id);
    if (res.ok) {
      router.push("/admin/productos");
    } else {
      alert(res.error);
    }
  }

  if (!ready) {
    return <p className="text-sm text-text-muted">Cargando…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
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
          onDeleteImage={deleteProductImage}
        />
      </div>
    </div>
  );
}
