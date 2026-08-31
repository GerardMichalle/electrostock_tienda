"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import { useProducts, useCategoriesState } from "@/lib/admin-store";

export default function CategoryPage() {
  const { category: categorySlug } = useParams<{ category: string }>();
  const { categories, loading: catLoading } = useCategoriesState();
  const { products, ready } = useProducts();

  const category = categories.find((c) => c.slug === categorySlug);

  if (catLoading && !category) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <p className="font-mono text-sm text-text-muted">Cargando…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!category) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
          <div className="text-center">
            <p className="text-text-muted">Esta categoría no existe.</p>
            <Link
              href="/"
              className="mt-4 inline-block border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
            >
              Ver catálogo
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const productList = products.filter((p) => p.categorySlug === category.slug);

  return (
    <>
      <Header />
      <Breadcrumb items={[{ label: category.name }]} />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {category.name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">{category.description}</p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
            <CategorySidebar category={category} />

            <div>
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <span className="font-mono text-xs text-text-muted">
                  {ready
                    ? `${productList.length} producto${productList.length !== 1 ? "s" : ""}`
                    : "Cargando…"}
                </span>
              </div>

              {ready && productList.length === 0 ? (
                <p className="border border-dashed border-border p-8 text-center text-sm text-text-muted">
                  Aún no hay productos publicados en esta categoría.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                  {productList.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
