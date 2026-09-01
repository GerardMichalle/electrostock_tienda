"use client";

import { useMemo, useState } from "react";
import { ExternalLink, FileDown, MessageCircle } from "lucide-react";
import { assetUrl } from "@/lib/api";
import {
  useAdminOrders,
  type AdminOrder,
  type OrderStatus,
  type Result,
} from "@/lib/admin-store";

const STATUS_ORDER: OrderStatus[] = [
  "PENDIENTE_VERIFICACION",
  "PAGO_VERIFICADO",
  "RECHAZADO",
  "ENVIADO",
  "ENTREGADO",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDIENTE_VERIFICACION: "Pendiente",
  PAGO_VERIFICADO: "Pago verificado",
  RECHAZADO: "Rechazado",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDIENTE_VERIFICACION: "bg-amber-50 text-amber-700",
  PAGO_VERIFICADO: "bg-accent-cyan/10 text-sky-700",
  RECHAZADO: "bg-red-50 text-red-600",
  ENVIADO: "bg-accent/10 text-accent",
  ENTREGADO: "bg-surface text-text-muted",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function money(value: string | number) {
  return `S/ ${Number(value).toFixed(2)}`;
}

/**
 * Normaliza el celular del pedido a formato internacional de Perú para el
 * link de WhatsApp. `customerPhone` se guarda tal cual lo escribe el
 * cliente (ej. "987 654 321", sin código de país). Devuelve `null` si no
 * parece un número válido.
 */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 9) return null;
  if (digits.length === 9) return `51${digits}`;
  return digits.startsWith("51") ? digits : `51${digits}`;
}

function buildWhatsappLink(order: AdminOrder): string | null {
  const phone = normalizePhone(order.customerPhone);
  if (!phone) return null;
  const message = [
    `Hola ${order.customerName}, gracias por tu compra en AMYTRONICS.`,
    "",
    `Pedido: ${order.orderNumber}`,
    "",
    "Productos:",
    ...order.items.map((i) => `• ${i.qty}× ${i.name}`),
    "",
    `Total: ${money(order.total)}`,
    "",
    `Entrega: ${order.address}${order.district ? `, ${order.district}` : ""}`,
  ].join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function AdminOrdersPage() {
  const { orders, ready, error, setStatus, downloadReceiptPdf } = useAdminOrders();
  const [filter, setFilter] = useState<OrderStatus | "TODOS">("TODOS");

  const visible = useMemo(
    () =>
      filter === "TODOS"
        ? orders
        : orders.filter((o) => o.status === filter),
    [orders, filter],
  );

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold">Pedidos</h1>
        <p className="mt-1 text-sm text-text-muted">
          {ready ? `${orders.length} pedidos recibidos` : "Cargando…"}
        </p>
      </div>

      {error && (
        <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {(["TODOS", ...STATUS_ORDER] as const).map((key) => {
          const active = filter === key;
          const count =
            key === "TODOS"
              ? orders.length
              : orders.filter((o) => o.status === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={active}
              className={`border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-text-muted hover:text-text"
              }`}
            >
              {key === "TODOS" ? "Todos" : STATUS_LABEL[key]} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-4">
        {!ready && (
          <p className="border border-border bg-bg px-4 py-8 text-center text-sm text-text-muted">
            Cargando pedidos…
          </p>
        )}
        {ready && visible.length === 0 && (
          <p className="border border-border bg-bg px-4 py-8 text-center text-sm text-text-muted">
            {orders.length === 0
              ? "Todavía no hay pedidos."
              : "No hay pedidos con ese estado."}
          </p>
        )}
        {visible.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onStatus={setStatus}
            onDownloadPdf={downloadReceiptPdf}
          />
        ))}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onStatus,
  onDownloadPdf,
}: {
  order: AdminOrder;
  onStatus: (id: string, status: OrderStatus) => Promise<Result>;
  onDownloadPdf: (id: string, orderNumber: string) => Promise<Result>;
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);

  const waLink = buildWhatsappLink(order);

  async function handleChange(next: OrderStatus) {
    if (next === order.status) return;
    setSaving(true);
    setErr("");
    const res = await onStatus(order.id, next);
    setSaving(false);
    if (!res.ok) setErr(res.error ?? "No se pudo actualizar.");
  }

  async function handlePdf() {
    setPdfBusy(true);
    setErr("");
    const res = await onDownloadPdf(order.id, order.orderNumber);
    setPdfBusy(false);
    if (!res.ok) setErr(res.error ?? "No se pudo descargar la boleta.");
  }

  return (
    <article className="border border-border bg-bg p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="select-text font-display text-sm font-bold">
            {order.orderNumber}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-text-muted">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[order.status]}`}
        >
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="text-sm">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Cliente
          </p>
          <p className="mt-1 select-text font-medium">{order.customerName}</p>
          <p className="select-text text-text-muted">{order.customerPhone}</p>
          <p className="mt-2 select-text text-text-muted">
            {order.address}
            {order.district ? `, ${order.district}` : ""}
          </p>
        </div>

        <div className="text-sm">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Pago
          </p>
          <p className="mt-1">
            Método:{" "}
            <span className="select-text font-medium">{order.paymentMethod}</span>
          </p>
          <p>
            Total:{" "}
            <span className="select-text font-display font-bold text-accent">
              {money(order.total)}
            </span>
          </p>
          {order.receiptUrl && (
            <a
              href={assetUrl(order.receiptUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 font-medium text-accent hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              Ver comprobante
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-dashed border-border pt-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
          Productos
        </p>
        <ul className="mt-1.5 space-y-1 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="select-text text-text-muted">
                {item.qty}× {item.name}
              </span>
              <span className="shrink-0 font-medium">
                {money(Number(item.price) * item.qty)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-3">
        <button
          type="button"
          onClick={() => void handlePdf()}
          disabled={pdfBusy}
          className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileDown className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          {pdfBusy ? "Generando…" : "Descargar boleta PDF"}
        </button>

        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium transition hover:border-accent hover:text-accent"
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            Enviar por WhatsApp
          </a>
        ) : (
          <span
            title="Este pedido no tiene un celular válido para armar el mensaje"
            className="inline-flex cursor-not-allowed items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-text-muted opacity-50"
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            Enviar por WhatsApp
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-3">
        <label className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
          Cambiar estado
        </label>
        <select
          value={order.status}
          disabled={saving}
          onChange={(e) => void handleChange(e.target.value as OrderStatus)}
          className="border border-border bg-bg px-2 py-1.5 text-sm outline-none focus:border-accent disabled:opacity-50"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        {saving && (
          <span className="font-mono text-xs text-text-muted">Guardando…</span>
        )}
        {err && <span className="text-xs text-red-600">{err}</span>}
      </div>
    </article>
  );
}
