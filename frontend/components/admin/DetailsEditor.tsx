"use client";

import type { ProductDetails } from "@/lib/data";

/**
 * Editor de la ficha ampliada (opcional) de un producto. Todo lo que se llene
 * aquí aparece en la página del producto como secciones tipo catálogo
 * (INFO / VENTAJAS / BENEFICIOS CLAVE / APLICACIONES / ESPECIFICACIONES
 * TÉCNICAS). Si se deja vacío, la página usa el diseño simple.
 */
export default function DetailsEditor({
  value,
  onChange,
}: {
  value: ProductDetails;
  onChange: (next: ProductDetails) => void;
}) {
  const advantages = value.advantages ?? [];
  const benefits = value.benefits ?? [];
  const applications = value.applications ?? [];
  const techSpecs = value.techSpecs ?? [];

  return (
    <div className="sm:col-span-2">
      <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
        Ficha ampliada (opcional)
      </p>
      <p className="mt-1 mb-4 text-xs text-text-muted">
        Rellena solo lo que tengas. Cada bloque con contenido se muestra en la
        página del producto; los vacíos se ocultan.
      </p>

      <div className="space-y-6 border border-border bg-surface/40 p-4">
        {/* INFO */}
        <Field label="Info — párrafo de presentación">
          <textarea
            value={value.info ?? ""}
            onChange={(e) => onChange({ ...value, info: e.target.value })}
            rows={4}
            placeholder="Presenta el producto: qué es, para qué sirve, por qué elegirlo."
            className={inputCls}
          />
        </Field>

        {/* VENTAJAS */}
        <Field label="Ventajas — subtítulo + explicación">
          <div className="space-y-3">
            {advantages.map((a, i) => (
              <div key={i} className="border border-border bg-bg p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={a.title}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        advantages: advantages.map((x, j) =>
                          j === i ? { ...x, title: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Título de la ventaja"
                    className={`${inputCls} font-medium`}
                  />
                  <RemoveBtn
                    onClick={() =>
                      onChange({
                        ...value,
                        advantages: advantages.filter((_, j) => j !== i),
                      })
                    }
                  />
                </div>
                <textarea
                  value={a.body}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      advantages: advantages.map((x, j) =>
                        j === i ? { ...x, body: e.target.value } : x,
                      ),
                    })
                  }
                  rows={2}
                  placeholder="Explica la ventaja en una o dos frases."
                  className={`${inputCls} mt-2`}
                />
              </div>
            ))}
            <AddBtn
              label="Añadir ventaja"
              onClick={() =>
                onChange({
                  ...value,
                  advantages: [...advantages, { title: "", body: "" }],
                })
              }
            />
          </div>
        </Field>

        {/* BENEFICIOS CLAVE */}
        <Field label="Beneficios clave — viñetas">
          <StringList
            items={benefits}
            placeholder="Ej: Velocidades ultrarrápidas para cargas intensivas"
            onChange={(next) => onChange({ ...value, benefits: next })}
            addLabel="Añadir beneficio"
          />
        </Field>

        {/* APLICACIONES */}
        <Field label="Aplicaciones — viñetas">
          <StringList
            items={applications}
            placeholder="Ej: Proyectos IoT con conectividad inalámbrica"
            onChange={(next) => onChange({ ...value, applications: next })}
            addLabel="Añadir aplicación"
          />
        </Field>

        {/* ESPECIFICACIONES TÉCNICAS */}
        <Field label="Especificaciones técnicas — dato / valor">
          <div className="space-y-2">
            {techSpecs.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={t.label}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      techSpecs: techSpecs.map((x, j) =>
                        j === i ? { ...x, label: e.target.value } : x,
                      ),
                    })
                  }
                  placeholder="Fabricante"
                  className={`${inputCls} sm:max-w-[38%]`}
                />
                <input
                  value={t.value}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      techSpecs: techSpecs.map((x, j) =>
                        j === i ? { ...x, value: e.target.value } : x,
                      ),
                    })
                  }
                  placeholder="Espressif"
                  className={inputCls}
                />
                <RemoveBtn
                  onClick={() =>
                    onChange({
                      ...value,
                      techSpecs: techSpecs.filter((_, j) => j !== i),
                    })
                  }
                />
              </div>
            ))}
            <AddBtn
              label="Añadir especificación"
              onClick={() =>
                onChange({
                  ...value,
                  techSpecs: [...techSpecs, { label: "", value: "" }],
                })
              }
            />
          </div>
        </Field>
      </div>
    </div>
  );
}

const inputCls =
  "w-full border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function StringList({
  items,
  placeholder,
  addLabel,
  onChange,
}: {
  items: string[];
  placeholder: string;
  addLabel: string;
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) =>
              onChange(items.map((x, j) => (j === i ? e.target.value : x)))
            }
            placeholder={placeholder}
            className={inputCls}
          />
          <RemoveBtn onClick={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddBtn label={addLabel} onClick={() => onChange([...items, ""])} />
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-dashed border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted transition hover:border-accent hover:text-accent"
    >
      + {label}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Quitar"
      className="shrink-0 border border-border px-2.5 py-2 text-sm text-text-muted transition hover:border-red-300 hover:text-red-600"
    >
      ×
    </button>
  );
}
