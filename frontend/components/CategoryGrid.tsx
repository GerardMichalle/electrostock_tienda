"use client";

import CategoryCard, { FEATURED_CATEGORY_SLUGS } from "@/components/CategoryCard";
import { useCategoriesState } from "@/lib/admin-store";

export default function CategoryGrid() {
  const { categories: all, loading, error } = useCategoriesState();
  const categories = all.filter((c) => FEATURED_CATEGORY_SLUGS.includes(c.slug));

  if (error) {
    return (
      <p className="mt-6 border border-dashed border-border p-8 text-center text-sm text-text-muted">
        {error}
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loading && categories.length === 0
        ? Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-16/10 animate-pulse border border-border bg-surface"
            />
          ))
        : categories.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
    </div>
  );
}
