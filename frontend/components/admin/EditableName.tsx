"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

export default function EditableName({
  value,
  onSave,
  className = "",
}: {
  value: string;
  onSave: (next: string) => { ok: boolean; error?: string };
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");

  function start() {
    setDraft(value);
    setError("");
    setEditing(true);
  }

  function commit() {
    if (draft.trim() === value) {
      setEditing(false);
      return;
    }
    const res = onSave(draft);
    if (!res.ok) {
      setError(res.error ?? "No se pudo guardar.");
      return;
    }
    setEditing(false);
    setError("");
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={start}
        className={`group inline-flex items-center gap-1.5 text-left ${className}`}
      >
        <span>{value}</span>
        <Pencil
          className="h-3 w-3 shrink-0 text-text-muted opacity-0 transition group-hover:opacity-100"
          strokeWidth={1.75}
        />
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <span className="inline-flex items-center gap-1">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="w-44 border border-border bg-bg px-2 py-1 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={commit}
          aria-label="Guardar"
          className="flex h-7 w-7 items-center justify-center border border-accent bg-accent text-white transition hover:bg-accent-dark"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          aria-label="Cancelar"
          className="flex h-7 w-7 items-center justify-center border border-border text-text-muted transition hover:border-accent hover:text-accent"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </span>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </span>
  );
}
