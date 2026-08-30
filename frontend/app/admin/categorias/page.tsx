"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useAdminCategories, useAdminProducts } from "@/lib/admin-store";
import EditableName from "@/components/admin/EditableName";

export default function AdminCategoriesPage() {
  const {
    categories,
    createCategory,
    renameCategory,
    deleteCategory,
    moveCategory,
    createSubcategory,
    renameSubcategory,
    deleteSubcategory,
    moveSubcategory,
    resetCategories,
  } = useAdminCategories();
  const { products } = useAdminProducts();

  const [newCat, setNewCat] = useState("");
  const [catError, setCatError] = useState("");
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newSub, setNewSub] = useState<Record<string, string>>({});

  const countByCat = (slug: string) =>
    products.filter((p) => p.categorySlug === slug).length;
  const countBySub = (catSlug: string, subSlug: string) =>
    products.filter(
      (p) => p.categorySlug === catSlug && p.subcategorySlug === subSlug,
    ).length;

  function setError(key: string, msg: string) {
    setRowError((prev) => ({ ...prev, [key]: msg }));
  }
  function clearError(key: string) {
    setRowError((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = createCategory(newCat);
    if (!res.ok) {
      setCatError(res.error ?? "No se pudo crear.");
      return;
    }
    setNewCat("");
    setCatError("");
  }

  function handleDeleteCat(slug: string, name: string) {
    const n = countByCat(slug);
    const res = deleteCategory(slug, n);
    if (!res.ok) {
      setError(`cat:${slug}`, res.error ?? "No se pudo eliminar.");
      return;
    }
    clearError(`cat:${slug}`);
    void name;
  }

  function handleAddSub(catSlug: string) {
    const res = createSubcategory(catSlug, newSub[catSlug] ?? "");
    if (!res.ok) {
      setError(`sub-new:${catSlug}`, res.error ?? "No se pudo crear.");
      return;
    }
    setNewSub((prev) => ({ ...prev, [catSlug]: "" }));
    clearError(`sub-new:${catSlug}`);
  }

  function handleDeleteSub(catSlug: string, subSlug: string) {
    const n = countBySub(catSlug, subSlug);
    const res = deleteSubcategory(catSlug, subSlug, n);
    if (!res.ok) {
      setError(`sub:${catSlug}:${subSlug}`, res.error ?? "No se pudo eliminar.");
      return;
    }
    clearError(`sub:${catSlug}:${subSlug}`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Categorías</h1>
          <p className="mt-1 text-sm text-text-muted">
            {categories.length} categoría{categories.length === 1 ? "" : "s"}. Los
            cambios se reflejan en la tienda al instante.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("¿Restaurar las categorías de ejemplo? Se perderán tus cambios.")) {
              resetCategories();
            }
          }}
          className="border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition hover:border-accent hover:text-accent"
        >
          Restaurar ejemplo
        </button>
      </div>

      <form
        onSubmit={handleCreate}
        className="mt-6 border border-border bg-bg p-4"
      >
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted">
          Nueva categoría
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Ej: Herramientas"
            className="min-w-0 flex-1 border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 border border-accent bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Agregar
          </button>
        </div>
        {catError && (
          <p className="mt-2 text-xs text-red-600" role="alert">
            {catError}
          </p>
        )}
        <p className="mt-2 font-mono text-[11px] text-text-muted">
          El identificador (slug) se genera solo a partir del nombre.
        </p>
      </form>

      <div className="mt-6 space-y-3">
        {categories.map((cat, index) => {
          const isOpen = expanded[cat.slug];
          const catKey = `cat:${cat.slug}`;
          return (
            <div key={cat.slug} className="border border-border bg-bg">
              <div className="flex flex-wrap items-center gap-3 p-4">
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    onClick={() => moveCategory(cat.slug, -1)}
                    disabled={index === 0}
                    aria-label="Subir categoría"
                    className="text-text-muted transition hover:text-accent disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCategory(cat.slug, 1)}
                    disabled={index === categories.length - 1}
                    aria-label="Bajar categoría"
                    className="text-text-muted transition hover:text-accent disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <EditableName
                    value={cat.name}
                    onSave={(next) => renameCategory(cat.slug, next)}
                    className="font-display text-base font-bold"
                  />
                  <p className="mt-0.5 select-text font-mono text-[11px] text-text-muted">
                    /{cat.slug} · {cat.subcategories.length} subcat. ·{" "}
                    {countByCat(cat.slug)} producto
                    {countByCat(cat.slug) === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [cat.slug]: !prev[cat.slug] }))
                    }
                    className="flex items-center gap-1 border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted transition hover:border-accent hover:text-accent"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                    )}
                    Subcategorías
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCat(cat.slug, cat.name)}
                    aria-label={`Eliminar ${cat.name}`}
                    className="flex h-8 w-8 items-center justify-center border border-border text-text-muted transition hover:border-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>

                {rowError[catKey] && (
                  <p className="w-full text-xs text-red-600" role="alert">
                    {rowError[catKey]}
                  </p>
                )}
              </div>

              {isOpen && (
                <div className="border-t border-border bg-surface p-4">
                  {cat.subcategories.length === 0 ? (
                    <p className="text-xs text-text-muted">
                      Sin subcategorías todavía.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {cat.subcategories.map((sub, subIndex) => {
                        const subKey = `sub:${cat.slug}:${sub.slug}`;
                        return (
                          <li
                            key={sub.slug}
                            className="flex flex-wrap items-center gap-3 border border-border bg-bg p-3"
                          >
                            <div className="flex shrink-0 flex-col">
                              <button
                                type="button"
                                onClick={() => moveSubcategory(cat.slug, sub.slug, -1)}
                                disabled={subIndex === 0}
                                aria-label="Subir subcategoría"
                                className="text-text-muted transition hover:text-accent disabled:opacity-30"
                              >
                                <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSubcategory(cat.slug, sub.slug, 1)}
                                disabled={subIndex === cat.subcategories.length - 1}
                                aria-label="Bajar subcategoría"
                                className="text-text-muted transition hover:text-accent disabled:opacity-30"
                              >
                                <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                              </button>
                            </div>

                            <div className="min-w-0 flex-1">
                              <EditableName
                                value={sub.name}
                                onSave={(next) =>
                                  renameSubcategory(cat.slug, sub.slug, next)
                                }
                                className="text-sm font-medium"
                              />
                              <p className="mt-0.5 select-text font-mono text-[11px] text-text-muted">
                                /{sub.slug} · {countBySub(cat.slug, sub.slug)} producto
                                {countBySub(cat.slug, sub.slug) === 1 ? "" : "s"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteSub(cat.slug, sub.slug)}
                              aria-label={`Eliminar ${sub.name}`}
                              className="flex h-7 w-7 shrink-0 items-center justify-center border border-border text-text-muted transition hover:border-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                            </button>

                            {rowError[subKey] && (
                              <p className="w-full text-xs text-red-600" role="alert">
                                {rowError[subKey]}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      value={newSub[cat.slug] ?? ""}
                      onChange={(e) =>
                        setNewSub((prev) => ({ ...prev, [cat.slug]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSub(cat.slug);
                        }
                      }}
                      placeholder="Nueva subcategoría"
                      className="min-w-0 flex-1 border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSub(cat.slug)}
                      className="flex items-center gap-1.5 border border-accent bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2} />
                      Agregar
                    </button>
                  </div>
                  {rowError[`sub-new:${cat.slug}`] && (
                    <p className="mt-2 text-xs text-red-600" role="alert">
                      {rowError[`sub-new:${cat.slug}`]}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
