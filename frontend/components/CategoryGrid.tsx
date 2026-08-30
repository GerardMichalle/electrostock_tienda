"use client";

import CategoryCard from "@/components/CategoryCard";
import { useCategories } from "@/lib/admin-store";

export default function CategoryGrid() {
  const categories = useCategories();

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => (
        <CategoryCard key={cat.slug} category={cat} />
      ))}
    </div>
  );
}
