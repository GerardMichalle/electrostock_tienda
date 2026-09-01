"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-store";
import logoMark from "@/src/img/logo-mark.png";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo iniciar sesión.");
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm border border-border bg-bg p-8">
        <div className="mb-6 flex items-center gap-2">
          <Image
            src={logoMark}
            alt="AMYTRONICS"
            width={32}
            height={32}
            loading="eager"
            className="h-8 w-8"
          />
          <span className="font-display text-base font-bold uppercase">
            Panel admin
          </span>
        </div>

        <p className="mb-6 text-sm text-text-muted">
          Ingresa con tu cuenta para gestionar el catálogo de AMYTRONICS.
        </p>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
              Correo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 border border-accent bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
          >
            {submitting ? "Entrando…" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
