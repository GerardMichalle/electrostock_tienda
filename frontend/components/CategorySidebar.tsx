import Link from "next/link";
import type { Category } from "@/lib/data";

export default function CategorySidebar({
  category,
  activeSubSlug,
}: {
  category: Category;
  activeSubSlug?: string;
}) {
  return (
    <aside className="h-fit border border-border bg-bg">
      <div className="border-b border-border bg-surface px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
          Filtrar por
        </p>
        <h2 className="font-display text-sm font-bold">{category.name}</h2>
      </div>
      <nav className="flex flex-col p-2">
        <Link
          href={`/${category.slug}`}
          className={`px-3 py-2 text-sm transition ${
            !activeSubSlug
              ? "bg-accent/10 font-medium text-accent"
              : "text-text-muted hover:bg-surface hover:text-text"
          }`}
        >
          Todas
        </Link>
        {category.subcategories.map((sub) => {
          const active = sub.slug === activeSubSlug;
          return (
            <Link
              key={sub.slug}
              href={`/${category.slug}/${sub.slug}`}
              className={`px-3 py-2 text-sm transition ${
                active
                  ? "bg-accent/10 font-medium text-accent"
                  : "text-text-muted hover:bg-surface hover:text-text"
              }`}
            >
              {sub.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
