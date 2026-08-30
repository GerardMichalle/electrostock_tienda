import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryBreadcrumb from "@/components/CategoryBreadcrumb";
import ProductGallery from "@/components/ProductGallery";
import AddToCartBar from "@/components/AddToCartBar";
import ProductCard from "@/components/ProductCard";
import yapeBadge from "@/src/img/yape-badge.png";
import plinBadge from "@/src/img/plin-badge.png";
import { products, getProduct, getRelatedProducts } from "@/lib/data";

const stockStyles: Record<string, string> = {
  "En stock": "bg-accent-cyan/10 text-sky-700",
  Agotado: "bg-surface text-text-muted",
  "Bajo pedido": "bg-amber-50 text-amber-700",
};

export function generateStaticParams() {
  return products.map((p) => ({
    category: p.categorySlug,
    subcategory: p.subcategorySlug,
    product: p.slug,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string; product: string }>;
}) {
  const { product: productSlug } = await params;

  const product = getProduct(productSlug);
  if (!product) notFound();

  const related = getRelatedProducts(product);

  return (
    <>
      <Header />
      <CategoryBreadcrumb
        categorySlug={product.categorySlug}
        subcategorySlug={product.subcategorySlug}
        current={product.name}
      />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <ProductGallery
              gallery={product.gallery}
              videoUrl={product.videoUrl}
              productName={product.name}
            />

            <div>
              <p className="select-text font-mono text-xs uppercase tracking-wider text-text-muted">
                SKU {product.sku}
              </p>
              <h1 className="mt-1 select-text font-display text-2xl font-bold sm:text-3xl">
                {product.name}
              </h1>

              <div className="mt-4 flex items-center gap-3">
                <span className="select-text font-display text-3xl font-bold text-accent">
                  S/ {product.price.toFixed(2)}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium ${stockStyles[product.stock]}`}
                >
                  {product.stock}
                </span>
              </div>

              <p className="mt-6 select-text text-sm leading-relaxed text-text-muted">
                {product.description}
              </p>

              <div className="mt-6 border border-border bg-surface p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  Especificaciones
                </p>
                <p className="mt-2 select-text font-mono text-sm">{product.spec}</p>
              </div>

              <AddToCartBar product={product} />

              <div className="mt-6 flex items-center gap-2.5 border-t border-dashed border-border pt-4">
                <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  Pagas con
                </span>
                <Image src={yapeBadge} alt="Yape" width={24} height={24} className="h-6 w-6" />
                <Image src={plinBadge} alt="Plin" width={24} height={24} className="h-6 w-6" />
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-16 border-t border-border pt-10">
              <h2 className="font-display text-xl font-bold">
                Productos relacionados
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                {related.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
