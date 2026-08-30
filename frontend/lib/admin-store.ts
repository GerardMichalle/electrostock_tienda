"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import {
  products as seedProducts,
  categories as seedCategories,
  type Product,
  type Category,
} from "@/lib/data";

const STORAGE_KEY = "electro_admin_products";
const CATEGORIES_KEY = "electro_admin_categories";
const AUTH_KEY = "electro_admin_auth";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readStorage(): Product[] {
  if (typeof window === "undefined") return seedProducts;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedProducts;
  try {
    return JSON.parse(raw) as Product[];
  } catch {
    return seedProducts;
  }
}

function writeStorage(products: Product[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProducts(readStorage());
    setReady(true);
  }, []);

  const persist = useCallback((next: Product[]) => {
    setProducts(next);
    writeStorage(next);
  }, []);

  const createProduct = useCallback(
    (product: Product) => {
      const current = readStorage();
      persist([product, ...current]);
    },
    [persist]
  );

  const updateProduct = useCallback(
    (slug: string, updates: Product) => {
      const current = readStorage();
      persist(current.map((p) => (p.slug === slug ? updates : p)));
    },
    [persist]
  );

  const deleteProduct = useCallback(
    (slug: string) => {
      const current = readStorage();
      persist(current.filter((p) => p.slug !== slug));
    },
    [persist]
  );

  const resetToDemoData = useCallback(() => {
    persist(seedProducts);
  }, [persist]);

  return {
    products,
    ready,
    createProduct,
    updateProduct,
    deleteProduct,
    resetToDemoData,
  };
}

// ---------------------------------------------------------------------------
// Categorías / subcategorías: mismo enfoque que productos, pero en un store a
// nivel de módulo (useSyncExternalStore) para que un cambio hecho en el panel
// se refleje al instante en la tienda pública (Header, home, listados) sin
// depender de un remount. `lib/data.ts` queda solo como semilla inicial.
// Cuando exista backend, esto pasa a leer/escribir de la API.
type CategoryResult = { ok: boolean; error?: string };

function readCategories(): Category[] {
  if (typeof window === "undefined") return seedCategories;
  const raw = window.localStorage.getItem(CATEGORIES_KEY);
  if (!raw) return seedCategories;
  try {
    const parsed = JSON.parse(raw) as Category[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedCategories;
  } catch {
    return seedCategories;
  }
}

let categoriesSnapshot: Category[] = readCategories();
const categoriesListeners = new Set<() => void>();

function writeCategories(next: Category[]) {
  window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
  categoriesSnapshot = next;
  categoriesListeners.forEach((listener) => listener());
}

function subscribeCategories(callback: () => void) {
  categoriesListeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CATEGORIES_KEY) {
      categoriesSnapshot = readCategories();
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    categoriesListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

/** Lista de categorías reactiva. La usan tanto el panel como la tienda pública. */
export function useCategories(): Category[] {
  return useSyncExternalStore(
    subscribeCategories,
    () => categoriesSnapshot,
    () => seedCategories,
  );
}

/** CRUD + reordenamiento de categorías y subcategorías (solo panel admin). */
export function useAdminCategories() {
  const categories = useCategories();

  const createCategory = useCallback((name: string): CategoryResult => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: "Escribe un nombre." };
    const slug = slugify(trimmed);
    if (!slug) return { ok: false, error: "Ese nombre no genera un identificador válido." };
    const current = readCategories();
    if (current.some((c) => c.slug === slug))
      return { ok: false, error: "Ya existe una categoría con un nombre parecido." };
    writeCategories([
      ...current,
      { slug, name: trimmed, description: "", subcategories: [] },
    ]);
    return { ok: true };
  }, []);

  const renameCategory = useCallback((slug: string, name: string): CategoryResult => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: "El nombre no puede quedar vacío." };
    writeCategories(
      readCategories().map((c) => (c.slug === slug ? { ...c, name: trimmed } : c)),
    );
    return { ok: true };
  }, []);

  const deleteCategory = useCallback(
    (slug: string, productCount: number): CategoryResult => {
      const current = readCategories();
      if (current.length <= 1)
        return { ok: false, error: "Debe existir al menos una categoría." };
      if (productCount > 0)
        return {
          ok: false,
          error: `No se puede borrar: tiene ${productCount} producto${
            productCount === 1 ? "" : "s"
          }. Muévelos o elimínalos primero.`,
        };
      writeCategories(current.filter((c) => c.slug !== slug));
      return { ok: true };
    },
    [],
  );

  const moveCategory = useCallback((slug: string, dir: -1 | 1) => {
    const current = [...readCategories()];
    const i = current.findIndex((c) => c.slug === slug);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= current.length) return;
    [current[i], current[j]] = [current[j], current[i]];
    writeCategories(current);
  }, []);

  const createSubcategory = useCallback(
    (catSlug: string, name: string): CategoryResult => {
      const trimmed = name.trim();
      if (!trimmed) return { ok: false, error: "Escribe un nombre." };
      const slug = slugify(trimmed);
      if (!slug) return { ok: false, error: "Ese nombre no genera un identificador válido." };
      const current = readCategories();
      const cat = current.find((c) => c.slug === catSlug);
      if (!cat) return { ok: false, error: "Categoría no encontrada." };
      if (cat.subcategories.some((s) => s.slug === slug))
        return { ok: false, error: "Ya existe una subcategoría con un nombre parecido." };
      writeCategories(
        current.map((c) =>
          c.slug === catSlug
            ? { ...c, subcategories: [...c.subcategories, { slug, name: trimmed }] }
            : c,
        ),
      );
      return { ok: true };
    },
    [],
  );

  const renameSubcategory = useCallback(
    (catSlug: string, subSlug: string, name: string): CategoryResult => {
      const trimmed = name.trim();
      if (!trimmed) return { ok: false, error: "El nombre no puede quedar vacío." };
      writeCategories(
        readCategories().map((c) =>
          c.slug === catSlug
            ? {
                ...c,
                subcategories: c.subcategories.map((s) =>
                  s.slug === subSlug ? { ...s, name: trimmed } : s,
                ),
              }
            : c,
        ),
      );
      return { ok: true };
    },
    [],
  );

  const deleteSubcategory = useCallback(
    (catSlug: string, subSlug: string, productCount: number): CategoryResult => {
      if (productCount > 0)
        return {
          ok: false,
          error: `No se puede borrar: tiene ${productCount} producto${
            productCount === 1 ? "" : "s"
          }. Muévelos o elimínalos primero.`,
        };
      writeCategories(
        readCategories().map((c) =>
          c.slug === catSlug
            ? { ...c, subcategories: c.subcategories.filter((s) => s.slug !== subSlug) }
            : c,
        ),
      );
      return { ok: true };
    },
    [],
  );

  const moveSubcategory = useCallback(
    (catSlug: string, subSlug: string, dir: -1 | 1) => {
      const current = readCategories().map((c) => {
        if (c.slug !== catSlug) return c;
        const subs = [...c.subcategories];
        const i = subs.findIndex((s) => s.slug === subSlug);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= subs.length) return c;
        [subs[i], subs[j]] = [subs[j], subs[i]];
        return { ...c, subcategories: subs };
      });
      writeCategories(current);
    },
    [],
  );

  const resetCategories = useCallback(() => writeCategories(seedCategories), []);

  return {
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
  };
}

// Auth simplificada: solo para probar el flujo del panel mientras no hay
// backend. Cuando exista, esto se reemplaza por un login real (Auth.js/JWT).
//
// El estado vive en un store a nivel de módulo (no en el estado local de cada
// hook) para que al iniciar sesión el layout del panel lo vea al instante, sin
// esperar a un remount ni volver a leer localStorage.
const authListeners = new Set<() => void>();

let authSnapshot: boolean | null =
  typeof window === "undefined"
    ? null
    : window.localStorage.getItem(AUTH_KEY) === "true";

function setAuth(value: boolean) {
  if (value) {
    window.localStorage.setItem(AUTH_KEY, "true");
  } else {
    window.localStorage.removeItem(AUTH_KEY);
  }
  authSnapshot = value;
  authListeners.forEach((listener) => listener());
}

function subscribeAuth(callback: () => void) {
  authListeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === AUTH_KEY) {
      authSnapshot = window.localStorage.getItem(AUTH_KEY) === "true";
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    authListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function useAdminAuth() {
  const isAuthenticated = useSyncExternalStore(
    subscribeAuth,
    () => authSnapshot,
    () => null,
  );

  const login = useCallback((email: string, password: string) => {
    const ok = email.trim().length > 0 && password.trim().length >= 4;
    if (ok) setAuth(true);
    return ok;
  }, []);

  const logout = useCallback(() => setAuth(false), []);

  return { isAuthenticated, login, logout };
}
