"use client";

import Link from "next/link";
import { useProducts, useCategories, useAdminOrders } from "@/lib/admin-store";

export default function AdminDashboard() {
  const { products, ready } = useProducts();
  const categories = useCategories();
  const { orders, ready: ordersReady } = useAdminOrders();

  const enStock = products.filter((p) => p.stock === "En stock").length;
  const agotado = products.filter((p) => p.stock === "Agotado").length;
  const bajoPedido = products.filter((p) => p.stock === "Bajo pedido").length;
  const pendientes = orders.filter(
    (o) => o.status === "PENDIENTE_VERIFICACION",
  ).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Resumen</h1>
      <p className="mt-1 text-sm text-text-muted">
        Vista general de tu catálogo.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-border bg-bg p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Total productos
          </p>
          <p className="mt-1 font-display text-2xl font-bold">
            {ready ? products.length : "—"}
          </p>
        </div>
        <div className="border border-border bg-bg p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            En stock
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-accent">
            {ready ? enStock : "—"}
          </p>
        </div>
        <div className="border border-border bg-bg p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Bajo pedido
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-600">
            {ready ? bajoPedido : "—"}
          </p>
        </div>
        <div className="border border-border bg-bg p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Agotados
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-text-muted">
            {ready ? agotado : "—"}
          </p>
        </div>
      </div>

      <Link
        href="/admin/pedidos"
        className="mt-4 flex items-center justify-between border border-border bg-bg p-4 transition hover:border-accent"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Pedidos por verificar
          </p>
          <p
            className={`mt-1 font-display text-2xl font-bold ${
              pendientes > 0 ? "text-accent" : "text-text-muted"
            }`}
          >
            {ordersReady ? pendientes : "—"}
          </p>
        </div>
        <span className="text-sm font-medium text-accent">Ver pedidos →</span>
      </Link>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/productos/nuevo"
          className="border border-accent bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
        >
          + Nuevo producto
        </Link>
        <Link
          href="/admin/productos"
          className="border border-border px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          Ver todos los productos
        </Link>
      </div>

      <div className="mt-10 border border-border bg-bg p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Categorías
          </p>
          <Link
            href="/admin/categorias"
            className="text-xs font-medium text-accent hover:underline"
          >
            Gestionar →
          </Link>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.slug} className="border border-dashed border-border p-3">
              <p className="font-display text-sm font-semibold">{cat.name}</p>
              <p className="mt-1 font-mono text-xs text-text-muted">
                {ready
                  ? products.filter((p) => p.categorySlug === cat.slug).length
                  : "—"}{" "}
                productos
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
