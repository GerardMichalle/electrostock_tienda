import type { ProductDetails } from "@/lib/data";

/**
 * Ficha ampliada del producto (INFO / VENTAJAS / BENEFICIOS CLAVE /
 * APLICACIONES / ESPECIFICACIONES TÉCNICAS). Cada bloque se muestra solo si
 * el admin lo llenó. Si no hay nada, el componente no renderiza nada.
 */
export default function ProductDetailSections({
  details,
}: {
  details?: ProductDetails;
}) {
  if (!details) return null;

  const { info, advantages, benefits, applications, techSpecs } = details;
  const hasAny =
    info ||
    advantages?.length ||
    benefits?.length ||
    applications?.length ||
    techSpecs?.length;
  if (!hasAny) return null;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="font-display text-xl font-bold">Descripción</h2>

      <div className="mt-6 divide-y divide-border border-y border-border">
        {info && (
          <Row label="Info">
            <p className="select-text whitespace-pre-line text-sm leading-relaxed text-text-muted">
              {info}
            </p>
          </Row>
        )}

        {!!advantages?.length && (
          <Row label="Ventajas">
            <div className="space-y-4">
              {advantages.map((a, i) => (
                <div key={i}>
                  <h3 className="select-text text-sm font-semibold text-text">
                    {a.title}
                  </h3>
                  <p className="mt-1 select-text text-sm leading-relaxed text-text-muted">
                    {a.body}
                  </p>
                </div>
              ))}
            </div>
          </Row>
        )}

        {!!benefits?.length && (
          <Row label="Beneficios clave">
            <BulletList items={benefits} />
          </Row>
        )}

        {!!applications?.length && (
          <Row label="Aplicaciones">
            <BulletList items={applications} />
          </Row>
        )}

        {!!techSpecs?.length && (
          <Row label="Especificaciones técnicas">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {techSpecs.map((t, i) => (
                <div
                  key={i}
                  className="flex justify-between gap-4 border-b border-dashed border-border py-1.5"
                >
                  <dt className="select-text text-sm text-text-muted">
                    {t.label}
                  </dt>
                  <dd className="select-text text-right text-sm font-medium text-text">
                    {t.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Row>
        )}
      </div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
      <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="select-text pl-4 -indent-4 text-sm leading-relaxed text-text-muted before:mr-2 before:text-accent before:content-['▸']"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
