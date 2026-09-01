"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CountryPhoneInput from "@/components/CountryPhoneInput";
import { useCart } from "@/lib/cart-context";
import { apiFetch, ApiError } from "@/lib/api";
import {
  DEFAULT_COUNTRY,
  type Country,
  composePhone,
  isValidNational,
} from "@/lib/countries";
import yapeBadge from "@/src/img/yape-badge.png";
import plinBadge from "@/src/img/plin-badge.png";
import yapeQr from "@/src/img/yape-qr.png";

type PaymentMethod = "yape" | "plin";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  verb: string;
  logo: StaticImageData;
  qr?: StaticImageData;
  phone: string;
  holder: string;
}[] = [
  {
    id: "yape",
    label: "Yape",
    verb: "Yapea",
    logo: yapeBadge,
    qr: yapeQr,
    phone: "934 665 410",
    holder: "Victor Avalos",
  },
  {
    id: "plin",
    label: "Plin",
    verb: "Plinea",
    logo: plinBadge,
    phone: "934 665 410",
    holder: "Victor Avalos",
  },
];

export default function CheckoutPage() {
  const { items, ready, totalPrice, clearCart } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("yape");
  const [name, setName] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phoneNational, setPhoneNational] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);

  const ADDRESS_MAX = 160;
  const phoneOk = isValidNational(phoneNational, phoneCountry);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const activeMethod =
    PAYMENT_METHODS.find((pm) => pm.id === method) ?? PAYMENT_METHODS[0];

  function handleReceiptUpload(file: File | null) {
    if (!file) return;
    setReceiptFile(file);
    setReceiptPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setTriedSubmit(true);

    if (!name.trim() || address.trim().length < 6) {
      setError("Completa tu nombre y una dirección de entrega válida.");
      return;
    }
    if (!phoneOk) {
      setError(`Revisa tu número de celular de ${phoneCountry.name}.`);
      return;
    }
    if (!receiptFile) {
      setError(`Sube la captura de tu pago por ${activeMethod.label}.`);
      return;
    }

    const fd = new FormData();
    fd.append("customerName", name.trim());
    fd.append("customerPhone", composePhone(phoneNational, phoneCountry));
    fd.append("address", address.trim());
    if (district.trim()) fd.append("district", district.trim());
    fd.append("paymentMethod", method === "yape" ? "YAPE" : "PLIN");
    fd.append("receipt", receiptFile);
    fd.append(
      "items",
      JSON.stringify(items.map((i) => ({ productId: i.productId, qty: i.qty }))),
    );

    setSubmitting(true);
    try {
      const order = await apiFetch<{ orderNumber: string }>("/api/orders", {
        method: "POST",
        body: fd,
      });
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
      setOrderNumber(order.orderNumber);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo enviar el pedido. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (orderPlaced) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
          <div className="w-full max-w-md border border-border bg-bg p-8 text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-accent">
              Pedido recibido
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold">
              ¡Gracias por tu compra!
            </h1>
            <p className="mt-3 text-sm text-text-muted">
              Tu número de pedido es{" "}
              <span className="select-text font-mono font-semibold text-text">
                {orderNumber}
              </span>
              . Verificaremos tu pago y te contactaremos por WhatsApp para
              coordinar el envío.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
            >
              Volver a la tienda
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (ready && items.length === 0) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
          <div className="text-center">
            <p className="text-text-muted">Tu carrito está vacío.</p>
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

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Pagar</h1>

          <form
            onSubmit={(e) => void handleSubmit(e)}
            noValidate
            className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]"
          >
            <div className="space-y-6">
              <div className="border border-border bg-bg p-5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  Datos de entrega
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-text-muted">
                      Nombre completo
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={70}
                      className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">
                      Celular (WhatsApp)
                    </label>
                    <CountryPhoneInput
                      country={phoneCountry}
                      national={phoneNational}
                      onCountryChange={setPhoneCountry}
                      onNationalChange={setPhoneNational}
                      invalid={triedSubmit && !phoneOk}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">
                      Distrito
                    </label>
                    <input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      maxLength={80}
                      className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
                      placeholder="La libertad, Trujillo"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="mb-1 flex items-baseline justify-between">
                      <label className="block text-xs text-text-muted">
                        Dirección
                      </label>
                      <span
                        className={`font-mono text-[11px] ${
                          address.length >= ADDRESS_MAX
                            ? "text-red-600"
                            : "text-text-muted"
                        }`}
                      >
                        {address.length}/{ADDRESS_MAX}
                      </span>
                    </div>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      maxLength={ADDRESS_MAX}
                      className={`w-full border bg-bg px-3 py-2 text-sm outline-none focus:border-accent ${
                        triedSubmit && address.trim().length < 6
                          ? "border-red-400"
                          : "border-border"
                      }`}
                      placeholder="Av. Siempre Viva 123, Urb. San Andrés, ref. frente al parque"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-border bg-bg p-5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  Método de pago
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((pm) => {
                    const active = method === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setMethod(pm.id)}
                        aria-pressed={active}
                        className={`corner-marks flex items-center gap-2.5 border px-3 py-2.5 text-sm font-medium transition hover:shadow-md ${
                          active
                            ? "is-active border-accent bg-accent/5 text-text"
                            : "border-border text-text-muted hover:text-text"
                        }`}
                      >
                        <span className="cm-tr" />
                        <span className="cm-br" />
                        <Image
                          src={pm.logo}
                          alt=""
                          width={28}
                          height={28}
                          className="h-7 w-7 shrink-0"
                        />
                        <span className="flex-1 text-left">{pm.label}</span>
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center border text-[10px] leading-none transition ${
                            active
                              ? "border-accent bg-accent text-white"
                              : "border-border text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-col items-center gap-4 border border-dashed border-border p-4 text-center sm:flex-row sm:items-center sm:text-left">
                  {activeMethod.qr ? (
                    <Image
                      src={activeMethod.qr}
                      alt={`Código QR para pagar con ${activeMethod.label}`}
                      width={192}
                      height={204}
                      unoptimized
                      className="h-auto w-48 shrink-0 border border-border"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-border bg-bg p-2.5">
                      <Image
                        src={activeMethod.logo}
                        alt={activeMethod.label}
                        width={56}
                        height={56}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="text-text-muted">
                      {activeMethod.qr
                        ? `Escanea el QR o ${activeMethod.verb.toLowerCase()} al número:`
                        : `${activeMethod.verb} al número:`}
                    </p>
                    <p className="select-text font-mono text-base font-semibold">
                      {activeMethod.phone}
                    </p>
                    <p className="select-text font-mono text-xs text-text-muted">
                      {activeMethod.holder}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-xs text-text-muted">
                    Sube la captura de tu pago
                  </label>
                  <label className="flex h-24 cursor-pointer items-center justify-center border border-dashed border-border font-mono text-xs text-text-muted transition hover:border-accent hover:text-accent">
                    {receiptPreview ? (
                      <div className="h-20 w-20 overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={receiptPreview}
                          alt="Comprobante de pago"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      "+ Subir captura del comprobante"
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleReceiptUpload(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="h-fit border border-border bg-surface p-5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Tu pedido
              </p>
              <div className="mt-3 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex select-text justify-between gap-3 text-sm"
                  >
                    <span className="text-text-muted">
                      {item.qty}× {item.name}
                    </span>
                    <span className="shrink-0 font-medium">
                      S/ {(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-dashed border-border pt-3 text-base">
                <span className="font-display font-bold">Total</span>
                <span className="select-text font-display font-bold text-accent">
                  S/ {totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full border border-accent bg-accent py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:border-border disabled:bg-surface disabled:text-text-muted"
              >
                {submitting ? "Enviando pedido…" : "Confirmar pedido"}
              </button>

              <div className="mt-4 border-t border-dashed border-border pt-3">
                <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-text">
                  <Lock className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                  Compra segura y protegida
                </p>
                <p className="mt-1 text-center text-[11px] leading-snug text-text-muted">
                  Verificamos tu pago antes de coordinar el envío. Tus datos solo
                  se usan para tu pedido.
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
