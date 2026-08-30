import Link from "next/link";

export default function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6">
        <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-text-muted">
          <li>
            <Link href="/" className="hover:text-accent">
              inicio
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              {item.href ? (
                <Link href={item.href} className="hover:text-accent">
                  {item.label}
                </Link>
              ) : (
                <span className="text-text">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
