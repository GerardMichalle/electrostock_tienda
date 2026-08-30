"use client";

import { useRouter } from "next/navigation";
import { useAdminProducts } from "@/lib/admin-store";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/data";

export default function NewProductPage() {
  const router = useRouter();
  const { createProduct } = useAdminProducts();

  function handleSubmit(product: Product) {
    createProduct(product);
    router.push("/admin/productos");
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Nuevo producto</h1>
      <p className="mt-1 text-sm text-text-muted">
        Completa la ficha y publícalo en la tienda.
      </p>

      <div className="mt-6">
        <ProductForm mode="create" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
