"use client";

import Breadcrumb from "@/components/Breadcrumb";
import { useCategories } from "@/lib/admin-store";

export default function CategoryBreadcrumb({
  categorySlug,
  subcategorySlug,
  current,
}: {
  categorySlug: string;
  subcategorySlug?: string;
  current: string;
}) {
  const categories = useCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  const subcategory = subcategorySlug
    ? category?.subcategories.find((s) => s.slug === subcategorySlug)
    : undefined;

  const items: { label: string; href?: string }[] = [];
  if (category) {
    items.push({ label: category.name, href: `/${category.slug}` });
    if (subcategory) {
      items.push({
        label: subcategory.name,
        href: `/${category.slug}/${subcategory.slug}`,
      });
    }
  }
  items.push({ label: current });

  return <Breadcrumb items={items} />;
}
