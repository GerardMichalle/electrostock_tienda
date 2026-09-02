"use client";

import { useState } from "react";
import { useAdminAuth } from "@/lib/admin-store";

export default function AdminAccountPage() {
  const { user, changePassword } = useAdminAuth();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone(false);

    if (!current || !next) {
      setError("Completa tu contraseña actual y la nueva.");
      return;
    }
    if (next.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (next !== confirm) {
      setError("La confirmación no coincide con la nueva contraseña.");
      return;
    }
    if (next === current) {
      setError("La nueva contraseña debe ser distinta de la actual.");
      return;
    }

    setBusy(true);
    const res = await changePassword(current, next);
    setBusy(false);

    if (res.ok) {
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } else {
      setError(res.error ?? "No se pudo cambiar la contraseña.");
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-bold">Mi cuenta</h1>
      <p className="mt-1 text-sm text-text-muted">
        Datos de tu usuario y cambio de contraseña.
      </p>

      <div className="mt-6 border border-border bg-bg p-4">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Correo</dt>
            <dd className="select-text font-medium">{user?.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Nombre</dt>
            <dd className="select-text font-medium">{user?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Rol</dt>
            <dd className="font-medium">{user?.role ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 border border-border bg-bg p-4"
      >
        <h2 className="font-display text-base font-bold">Cambiar contraseña</h2>

        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Contraseña actual
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Nueva contraseña (mínimo 8 caracteres)
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Repetir la nueva contraseña
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {done && (
          <p className="text-sm font-medium text-green-700" role="status">
            Contraseña actualizada. Úsala la próxima vez que inicies sesión.
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {busy ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
