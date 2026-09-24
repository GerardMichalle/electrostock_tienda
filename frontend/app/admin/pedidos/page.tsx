"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ExternalLink,
  FileDown,
  MessageCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
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

/** Pedidos por página en la grilla. 24 = 6 filas de 4 columnas. */
const PAGE_SIZE = 24;

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
 * Normaliza el celular del pedido a formato internacional para el link de
 * WhatsApp. Los pedidos nuevos guardan el número con código de país
 * (ej. "+51987654321"); los antiguos venían sin código, asumimos Perú.
 * Devuelve `null` si no parece un número válido.
 */
function normalizePhone(raw: string): string | null {
  const hasCountryCode = raw.trim().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return null;
  if (hasCountryCode) return digits; // ya viene en formato internacional
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
  const { orders, ready, error, setStatus, deleteOrder, downloadReceiptPdf } =
    useAdminOrders();
  const [filter, setFilter] = useState<OrderStatus | "TODOS">("TODOS");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return orders.filter((o) => {
      if (filter !== "TODOS" && o.status !== filter) return false;
      if (!q) return true;
      const matchesPhone =
        qDigits.length > 0 &&
        o.customerPhone.replace(/\D/g, "").includes(qDigits);
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        matchesPhone
      );
    });
  }, [orders, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Al cambiar filtro o búsqueda volvemos a la primera página.
  function changeFilter(next: OrderStatus | "TODOS") {
    setFilter(next);
    setPage(1);
  }

  function changeQuery(next: string) {
    setQuery(next);
    setPage(1);
  }

  function goToPage(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // El pedido abierto en el modal se toma siempre de la lista viva, así el
  // cambio de estado se refleja al instante y si se elimina el modal se cierra.
  const selected = selectedId
    ? orders.find((o) => o.id === selectedId) ?? null
    : null;

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

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

      <div className="mt-5 flex flex-wrap items-center gap-2">
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
              onClick={() => changeFilter(key)}
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

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            strokeWidth={1.75}
          />
          <input
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder="Buscar por N.º, cliente o celular…"
            className="w-full border border-border bg-bg py-2 pl-8 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
        {ready && (
          <p className="font-mono text-xs text-text-muted">
            {filtered.length === 0
              ? "0 resultados"
              : `Mostrando ${rangeStart}–${rangeEnd} de ${filtered.length}`}
          </p>
        )}
      </div>

      {!ready && (
        <p className="mt-5 border border-border bg-bg px-4 py-8 text-center text-sm text-text-muted">
          Cargando pedidos…
        </p>
      )}

      {ready && filtered.length === 0 && (
        <p className="mt-5 border border-border bg-bg px-4 py-8 text-center text-sm text-text-muted">
          {orders.length === 0
            ? "Todavía no hay pedidos."
            : "Ningún pedido coincide con el filtro o la búsqueda."}
        </p>
      )}

      {ready && pageItems.length > 0 && (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOpen={() => setSelectedId(order.id)}
                onStatus={setStatus}
              />
            ))}
          </div>

          <Pager page={safePage} totalPages={totalPages} onPage={goToPage} />
        </>
      )}

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelectedId(null)}
          onStatus={setStatus}
          onDelete={deleteOrder}
          onDownloadPdf={downloadReceiptPdf}
        />
      )}
    </div>
  );
}

function OrderCard({
  order,
  onOpen,
  onStatus,
}: {
  order: AdminOrder;
  onOpen: () => void;
  onStatus: (id: string, status: OrderStatus) => Promise<Result>;
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const itemsCount = order.items.reduce((n, i) => n + i.qty, 0);

  async function handleChange(next: OrderStatus) {
    if (next === order.status) return;
    setSaving(true);
    setErr("");
    const res = await onStatus(order.id, next);
    setSaving(false);
    if (!res.ok) setErr(res.error ?? "No se pudo actualizar.");
  }

  return (
    <article className="flex flex-col border border-border bg-bg p-4 transition hover:border-accent/60">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onOpen}
            className="select-text truncate font-display text-sm font-bold hover:text-accent hover:underline"
          >
            {order.orderNumber}
          </button>
          <p className="mt-0.5 font-mono text-[11px] text-text-muted">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[order.status]}`}
        >
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="mt-3 min-w-0 text-sm">
        <p className="select-text truncate font-medium">{order.customerName}</p>
        <p className="select-text truncate text-text-muted">
          {order.customerPhone}
        </p>
      </div>

      {order.receiptUrl && (
        <a
          href={assetUrl(order.receiptUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex w-fit items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          Ver comprobante
        </a>
      )}

      <div className="mt-3 flex items-end justify-between gap-2 border-t border-dashed border-border pt-3">
        <span className="text-xs text-text-muted">
          {itemsCount} {itemsCount === 1 ? "producto" : "productos"}
        </span>
        <span className="select-text font-display font-bold text-accent">
          {money(order.total)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <select
          value={order.status}
          disabled={saving}
          onChange={(e) => void handleChange(e.target.value as OrderStatus)}
          aria-label={`Cambiar estado de ${order.orderNumber}`}
          className="min-w-0 flex-1 border border-border bg-bg px-2 py-1.5 text-xs outline-none focus:border-accent disabled:opacity-50"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 border border-border px-2.5 py-1.5 text-xs font-medium transition hover:border-accent hover:text-accent"
        >
          Ver detalle
        </button>
      </div>

      {(saving || err) && (
        <p
          className={`mt-2 text-xs ${err ? "text-red-600" : "text-text-muted"}`}
        >
          {err || "Guardando…"}
        </p>
      )}
    </article>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onStatus,
  onDelete,
  onDownloadPdf,
}: {
  order: AdminOrder;
  onClose: () => void;
  onStatus: (id: string, status: OrderStatus) => Promise<Result>;
  onDelete: (id: string) => Promise<Result>;
  onDownloadPdf: (id: string, orderNumber: string) => Promise<Result>;
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [delBusy, setDelBusy] = useState(false);

  const waLink = buildWhatsappLink(order);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

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

  async function handleDelete() {
    setDelBusy(true);
    setErr("");
    const res = await onDelete(order.id);
    // si sale bien, el pedido desaparece de la lista y el modal se cierra solo
    if (!res.ok) {
      setDelBusy(false);
      setConfirmDel(false);
      setErr(res.error ?? "No se pudo eliminar el pedido.");
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Pedido ${order.orderNumber}`}
    >
      <div
        className="relative my-auto w-full max-w-lg border border-border bg-bg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center border border-border bg-bg text-text-muted transition hover:border-accent hover:text-accent"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
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
              <p className="mt-1 select-text font-medium">
                {order.customerName}
              </p>
              <p className="select-text text-text-muted">
                {order.customerPhone}
              </p>
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
                <span className="select-text font-medium">
                  {order.paymentMethod}
                </span>
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
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0"
                    strokeWidth={1.75}
                  />
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
                <MessageCircle
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.75}
                />
                Enviar por WhatsApp
              </a>
            ) : (
              <span
                title="Este pedido no tiene un celular válido para armar el mensaje"
                className="inline-flex cursor-not-allowed items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-text-muted opacity-50"
              >
                <MessageCircle
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.75}
                />
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
              <span className="font-mono text-xs text-text-muted">
                Guardando…
              </span>
            )}
            {err && <span className="text-xs text-red-600">{err}</span>}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-3">
            {confirmDel ? (
              <span className="ml-auto inline-flex items-center gap-2 text-xs">
                <span className="text-text-muted">¿Eliminar este pedido?</span>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={delBusy}
                  className="border border-red-300 bg-red-50 px-2 py-1 font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                  {delBusy ? "Eliminando…" : "Sí, eliminar"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDel(false)}
                  disabled={delBusy}
                  className="border border-border px-2 py-1 text-text-muted transition hover:text-text disabled:opacity-50"
                >
                  Cancelar
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDel(true)}
                title="Eliminar el pedido de forma permanente"
                className="ml-auto inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition hover:border-red-300 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Pager({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (next: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="border border-border px-3 py-1.5 text-xs font-medium transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Anterior
      </button>
      <span className="font-mono text-xs text-text-muted">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="border border-border px-3 py-1.5 text-xs font-medium transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente →
      </button>
    </div>
  );
}
