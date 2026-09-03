"use client";

import { useState } from "react";
import { useAdminSettings } from "@/lib/admin-store";
import { assetUrl } from "@/lib/api";
import type { StoreSettings } from "@/lib/data";

export default function AdminSettingsPage() {
  const { settings, ready, error, save } = useAdminSettings();

  if (!ready) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold">Pagos</h1>
        <p className="mt-4 font-mono text-sm text-text-muted">Cargando…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Datos de pago</h1>
      <p className="mt-1 text-sm text-text-muted">
        Lo que ve el cliente en el checkout al pagar por Yape o Plin. Los
        cambios se reflejan en la tienda al instante.
      </p>
      {error && (
        <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <SettingsForm initial={settings} onSave={save} />
    </div>
  );
}

function SettingsForm({
  initial,
  onSave,
}: {
  initial: StoreSettings;
  onSave: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [businessName, setBusinessName] = useState(initial.businessName ?? "");
  const [yapeNumber, setYapeNumber] = useState(initial.yapeNumber ?? "");
  const [plinNumber, setPlinNumber] = useState(initial.plinNumber ?? "");

  // Por cada QR: file = imagen nueva elegida; cleared = se quitó la actual.
  const [yapeQr, setYapeQr] = useState<{ file: File | null; cleared: boolean }>({
    file: null,
    cleared: false,
  });
  const [plinQr, setPlinQr] = useState<{ file: File | null; cleared: boolean }>({
    file: null,
    cleared: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  function qrPreview(
    state: { file: File | null; cleared: boolean },
    currentUrl: string | null,
  ): string | null {
    if (state.file) return URL.createObjectURL(state.file);
    if (state.cleared) return null;
    return currentUrl ? assetUrl(currentUrl) : null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setDone(false);

    const fd = new FormData();
    fd.append("businessName", businessName.trim());
    fd.append("yapeNumber", yapeNumber.trim());
    fd.append("plinNumber", plinNumber.trim());
    if (yapeQr.file) fd.append("yapeQrFile", yapeQr.file);
    else if (yapeQr.cleared) fd.append("yapeQrClear", "1");
    if (plinQr.file) fd.append("plinQrFile", plinQr.file);
    else if (plinQr.cleared) fd.append("plinQrClear", "1");

    setSubmitting(true);
    const res = await onSave(fd);
    setSubmitting(false);

    if (res.ok) {
      setDone(true);
      setYapeQr({ file: null, cleared: false });
      setPlinQr({ file: null, cleared: false });
    } else {
      setErr(res.error ?? "No se pudo guardar.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-6">
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
          Nombre del titular / empresa (se muestra al pagar)
        </label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          maxLength={120}
          placeholder="Ej: AMYTRONICS S.A.C."
          className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <QrBlock
        title="Yape"
        number={yapeNumber}
        onNumber={setYapeNumber}
        preview={qrPreview(yapeQr, initial.yapeQrUrl)}
        onFile={(file) => setYapeQr({ file, cleared: false })}
        onClear={() => setYapeQr({ file: null, cleared: true })}
      />

      <QrBlock
        title="Plin"
        number={plinNumber}
        onNumber={setPlinNumber}
        preview={qrPreview(plinQr, initial.plinQrUrl)}
        onFile={(file) => setPlinQr({ file, cleared: false })}
        onClear={() => setPlinQr({ file: null, cleared: true })}
      />

      {err && (
        <p className="text-sm text-red-600" role="alert">
          {err}
        </p>
      )}
      {done && (
        <p className="text-sm font-medium text-green-700" role="status">
          Datos de pago actualizados.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {submitting ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

function QrBlock({
  title,
  number,
  onNumber,
  preview,
  onFile,
  onClear,
}: {
  title: string;
  number: string;
  onNumber: (v: string) => void;
  preview: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <fieldset className="border border-border p-4">
      <legend className="px-1 font-display text-sm font-bold">{title}</legend>

      <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
        Número
      </label>
      <input
        value={number}
        onChange={(e) => onNumber(e.target.value)}
        maxLength={40}
        placeholder="934 665 410"
        className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
      />

      <label className="mb-1 mt-4 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
        Código QR (imagen)
      </label>
      <div className="flex items-start gap-4">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center border border-dashed border-border bg-surface">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={`QR de ${title}`}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="font-mono text-[10px] text-text-muted">Sin QR</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer border border-border px-3 py-1.5 text-center text-xs font-medium text-text-muted transition hover:border-accent hover:text-accent">
            {preview ? "Cambiar QR" : "Subir QR"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFile(file);
                e.target.value = "";
              }}
            />
          </label>
          {preview && (
            <button
              type="button"
              onClick={onClear}
              className="border border-border px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-400"
            >
              Quitar QR
            </button>
          )}
          <p className="max-w-[16rem] font-mono text-[11px] text-text-muted">
            Si no hay QR, el checkout solo muestra el número. PNG o JPG, máx 8 MB.
          </p>
        </div>
      </div>
    </fieldset>
  );
}
