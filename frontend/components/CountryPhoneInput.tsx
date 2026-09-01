"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import Flag from "@/components/Flag";
import {
  COUNTRIES,
  type Country,
  sanitizeNational,
} from "@/lib/countries";

/**
 * Campo de celular con selector de país (bandera + código). El número se limita
 * a la cantidad de dígitos del país elegido. El componente es controlado:
 * el padre guarda `country` (iso) y `national` (solo dígitos).
 */
export default function CountryPhoneInput({
  country,
  national,
  onCountryChange,
  onNationalChange,
  invalid = false,
  id,
}: {
  country: Country;
  national: string;
  onCountryChange: (c: Country) => void;
  onNationalChange: (digits: string) => void;
  invalid?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  function openMenu() {
    setQuery("");
    setOpen(true);
  }
  function closeMenu() {
    setOpen(false);
  }

  // cerrar al hacer clic fuera / con Escape
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    const digits = q.replace(/\D/g, "");
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (digits.length > 0 && c.dial.includes(digits)) ||
        c.iso === q,
    );
  }, [query]);

  const digitsLeft = country.max - national.length;

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={`flex items-stretch border bg-bg transition focus-within:border-accent ${
          invalid ? "border-red-400" : "border-border"
        }`}
      >
        <button
          type="button"
          onClick={() => (open ? closeMenu() : openMenu())}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`País: ${country.name}. Cambiar`}
          className="flex shrink-0 items-center gap-1.5 border-r border-border px-2.5 text-sm outline-none transition hover:bg-surface focus-visible:bg-surface"
        >
          <Flag iso={country.iso} className="h-3.5 w-5" />
          <span className="font-mono text-text-muted">+{country.dial}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-text-muted transition ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </button>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={national}
          maxLength={country.max}
          onChange={(e) =>
            onNationalChange(sanitizeNational(e.target.value, country))
          }
          placeholder={country.example}
          className="w-full min-w-0 bg-transparent px-3 py-2 text-sm tracking-wide outline-none"
        />
      </div>

      <p
        className={`mt-1 text-[11px] ${invalid ? "text-red-600" : "text-text-muted"}`}
      >
        {invalid
          ? `Ingresa un número de ${country.name} válido (${
              country.min === country.max
                ? `${country.max} dígitos`
                : `${country.min}–${country.max} dígitos`
            }).`
          : `${country.name} · ${
              country.min === country.max
                ? `${country.max} dígitos`
                : `${country.min}–${country.max} dígitos`
            }${
              national.length > 0 && digitsLeft >= 0
                ? ` · faltan ${digitsLeft}`
                : ""
            }`}
      </p>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-72 max-w-[calc(100vw-2rem)] border border-border bg-bg shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={2} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar país o código"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {results.map((c) => {
              const active = c.iso === country.iso;
              return (
                <li key={c.iso}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onCountryChange(c);
                      onNationalChange(sanitizeNational(national, c));
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-surface ${
                      active ? "bg-accent/5 font-medium" : ""
                    }`}
                  >
                    <Flag iso={c.iso} className="h-3.5 w-5" />
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="font-mono text-xs text-text-muted">
                      +{c.dial}
                    </span>
                    {active && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                    )}
                  </button>
                </li>
              );
            })}
            {results.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-text-muted">
                Sin resultados
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
