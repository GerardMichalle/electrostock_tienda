"use client";

import { useCallback, useSyncExternalStore } from "react";
import { apiFetch, ApiError, API_URL } from "@/lib/api";
import {
  adaptCategory,
  adaptProduct,
  type ApiCategory,
  type ApiProduct,
} from "@/lib/adapters";
import type { Category, Product } from "@/lib/data";

const TOKEN_KEY = "electro_admin_token";

export type Result = { ok: boolean; error?: string };
/** @deprecated usa `Result` */
export type CategoryResult = Result;

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function errMsg(e: unknown, fallback: string) {
  return e instanceof ApiError ? e.message : fallback;
}

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}


// Store de categorías (lectura pública + escritura admin) todo detallado


type CatState = { list: Category[]; loaded: boolean; error: string | null };

let catState: CatState = { list: [], loaded: false, error: null };
const CAT_SERVER: CatState = { list: [], loaded: false, error: null };
const catListeners = new Set<() => void>();
let catLoading: Promise<void> | null = null;

function emitCat() {
  catListeners.forEach((l) => l());
}

async function loadCategories(force = false): Promise<void> {
  if (catLoading) return catLoading;
  if (catState.loaded && !force) return;
  catLoading = (async () => {
    try {
      const raw = await apiFetch<ApiCategory[]>("/api/categories");
      catState = { list: raw.map(adaptCategory), loaded: true, error: null };
    } catch (e) {
      catState = {
        list: catState.list,
        loaded: true,
        error: errMsg(e, "No se pudieron cargar las categorías."),
      };
    } finally {
      catLoading = null;
      emitCat();
    }
  })();
  return catLoading;
}

function subscribeCategories(cb: () => void) {
  catListeners.add(cb);
  if (!catState.loaded) void loadCategories();
  return () => {
    catListeners.delete(cb);
  };
}

function useCatState(): CatState {
  return useSyncExternalStore(
    subscribeCategories,
    () => catState,
    () => CAT_SERVER,
  );
}

/** Lista de categorías (tienda pública y panel). */
export function useCategories(): Category[] {
  return useCatState().list;
}

/** Igual que `useCategories` pero con `loading` y `error`. */
export function useCategoriesState() {
  const s = useCatState();
  return { categories: s.list, loading: !s.loaded, error: s.error };
}

function findCat(slug: string) {
  return catState.list.find((c) => c.slug === slug);
}
function findSub(catSlug: string, subSlug: string) {
  return findCat(catSlug)?.subcategories.find((s) => s.slug === subSlug);
}

/** CRUD + reordenamiento de categorías/subcategorías (panel admin). */
export function useAdminCategories() {
  const state = useCatState();

  const reload = useCallback(() => loadCategories(true), []);

  const createCategory = useCallback(async (name: string): Promise<Result> => {
    try {
      await apiFetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        token: readToken(),
      });
      await loadCategories(true);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e, "No se pudo crear la categoría.") };
    }
  }, []);

  const renameCategory = useCallback(
    async (slug: string, name: string): Promise<Result> => {
      const cat = findCat(slug);
      if (!cat?.id) return { ok: false, error: "Categoría no encontrada." };
      try {
        await apiFetch(`/api/categories/${cat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
          token: readToken(),
        });
        await loadCategories(true);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "No se pudo renombrar.") };
      }
    },
    [],
  );

  const deleteCategory = useCallback(
    async (slug: string): Promise<Result> => {
      const cat = findCat(slug);
      if (!cat?.id) return { ok: false, error: "Categoría no encontrada." };
      try {
        await apiFetch(`/api/categories/${cat.id}`, {
          method: "DELETE",
          token: readToken(),
        });
        await loadCategories(true);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "No se pudo eliminar.") };
      }
    },
    [],
  );

  const moveCategory = useCallback(async (slug: string, dir: -1 | 1) => {
    const cat = findCat(slug);
    if (!cat?.id) return;
    try {
      await apiFetch(`/api/categories/${cat.id}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: dir < 0 ? "up" : "down" }),
        token: readToken(),
      });
      await loadCategories(true);
    } catch {
      /* no-op visual: la lista se queda como estaba */
    }
  }, []);

  const createSubcategory = useCallback(
    async (catSlug: string, name: string): Promise<Result> => {
      const cat = findCat(catSlug);
      if (!cat?.id) return { ok: false, error: "Categoría no encontrada." };
      try {
        await apiFetch(`/api/categories/${cat.id}/subcategories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
          token: readToken(),
        });
        await loadCategories(true);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "No se pudo crear la subcategoría.") };
      }
    },
    [],
  );

  const renameSubcategory = useCallback(
    async (catSlug: string, subSlug: string, name: string): Promise<Result> => {
      const cat = findCat(catSlug);
      const sub = findSub(catSlug, subSlug);
      if (!cat?.id || !sub?.id) return { ok: false, error: "Subcategoría no encontrada." };
      try {
        await apiFetch(`/api/categories/${cat.id}/subcategories/${sub.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
          token: readToken(),
        });
        await loadCategories(true);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "No se pudo renombrar.") };
      }
    },
    [],
  );

  const deleteSubcategory = useCallback(
    async (catSlug: string, subSlug: string): Promise<Result> => {
      const cat = findCat(catSlug);
      const sub = findSub(catSlug, subSlug);
      if (!cat?.id || !sub?.id) return { ok: false, error: "Subcategoría no encontrada." };
      try {
        await apiFetch(`/api/categories/${cat.id}/subcategories/${sub.id}`, {
          method: "DELETE",
          token: readToken(),
        });
        await loadCategories(true);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "No se pudo eliminar.") };
      }
    },
    [],
  );

  const moveSubcategory = useCallback(
    async (catSlug: string, subSlug: string, dir: -1 | 1) => {
      const cat = findCat(catSlug);
      const sub = findSub(catSlug, subSlug);
      if (!cat?.id || !sub?.id) return;
      try {
        await apiFetch(`/api/categories/${cat.id}/subcategories/${sub.id}/move`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ direction: dir < 0 ? "up" : "down" }),
          token: readToken(),
        });
        await loadCategories(true);
      } catch {
        /* no-op */
      }
    },
    [],
  );

  return {
    categories: state.list,
    loading: !state.loaded,
    error: state.error,
    reload,
    createCategory,
    renameCategory,
    deleteCategory,
    moveCategory,
    createSubcategory,
    renameSubcategory,
    deleteSubcategory,
    moveSubcategory,
  };
}

// ===========================================================================
// Store de productos (lectura pública + escritura admin)
// ===========================================================================

type ProdState = { list: Product[]; loaded: boolean; error: string | null };

let prodState: ProdState = { list: [], loaded: false, error: null };
const PROD_SERVER: ProdState = { list: [], loaded: false, error: null };
const prodListeners = new Set<() => void>();
let prodLoading: Promise<void> | null = null;

async function loadProducts(force = false): Promise<void> {
  if (prodLoading) return prodLoading;
  if (prodState.loaded && !force) return;
  prodLoading = (async () => {
    try {
      const raw = await apiFetch<{ items: ApiProduct[] }>(
        "/api/products?pageSize=200",
      );
      prodState = {
        list: raw.items.map(adaptProduct),
        loaded: true,
        error: null,
      };
    } catch (e) {
      prodState = {
        list: prodState.list,
        loaded: true,
        error: errMsg(e, "No se pudieron cargar los productos."),
      };
    } finally {
      prodLoading = null;
      prodListeners.forEach((l) => l());
    }
  })();
  return prodLoading;
}

function subscribeProducts(cb: () => void) {
  prodListeners.add(cb);
  if (!prodState.loaded) void loadProducts();
  return () => {
    prodListeners.delete(cb);
  };
}

function useProdState(): ProdState {
  return useSyncExternalStore(
    subscribeProducts,
    () => prodState,
    () => PROD_SERVER,
  );
}

/** Lista de productos para la tienda pública. */
export function useProducts() {
  const state = useProdState();
  return {
    products: state.list,
    ready: state.loaded,
    error: state.error,
    reload: () => loadProducts(true),
  };
}

/** Lista + CRUD de productos (panel admin). `FormData` porque hay fotos. */
export function useAdminProducts() {
  const state = useProdState();

  const createProduct = useCallback(
    async (formData: FormData): Promise<Result> => {
      try {
        await apiFetch("/api/products", {
          method: "POST",
          body: formData,
          token: readToken(),
        });
        await loadProducts(true);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "No se pudo crear el producto.") };
      }
    },
    [],
  );

  const updateProduct = useCallback(
    async (id: string, formData: FormData): Promise<Result> => {
      try {
        await apiFetch(`/api/products/${id}`, {
          method: "PATCH",
          body: formData,
          token: readToken(),
        });
        await loadProducts(true);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "No se pudo guardar el producto.") };
      }
    },
    [],
  );

  const deleteProduct = useCallback(async (id: string): Promise<Result> => {
    try {
      await apiFetch(`/api/products/${id}`, {
        method: "DELETE",
        token: readToken(),
      });
      await loadProducts(true);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e, "No se pudo eliminar el producto.") };
    }
  }, []);

  const deleteProductImage = useCallback(
    async (imageId: string): Promise<Result> => {
      try {
        await apiFetch(`/api/products/images/${imageId}`, {
          method: "DELETE",
          token: readToken(),
        });
        await loadProducts(true);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "No se pudo quitar la foto.") };
      }
    },
    [],
  );

  return {
    products: state.list,
    ready: state.loaded,
    error: state.error,
    reload: () => loadProducts(true),
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProductImage,
  };
}

// ===========================================================================
// Store de pedidos (solo panel admin)
// ===========================================================================

export type OrderStatus =
  | "PENDIENTE_VERIFICACION"
  | "PAGO_VERIFICADO"
  | "RECHAZADO"
  | "ENVIADO"
  | "ENTREGADO";

export type AdminOrderItem = {
  id: string;
  name: string;
  price: string;
  qty: number;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  district: string | null;
  paymentMethod: "YAPE" | "PLIN";
  receiptUrl: string;
  status: OrderStatus;
  total: string;
  items: AdminOrderItem[];
  createdAt: string;
};

type OrdState = { list: AdminOrder[]; loaded: boolean; error: string | null };

let ordState: OrdState = { list: [], loaded: false, error: null };
const ORD_SERVER: OrdState = { list: [], loaded: false, error: null };
const ordListeners = new Set<() => void>();
let ordLoading: Promise<void> | null = null;

async function loadOrders(force = false): Promise<void> {
  if (ordLoading) return ordLoading;
  if (ordState.loaded && !force) return;
  ordLoading = (async () => {
    try {
      const raw = await apiFetch<AdminOrder[]>("/api/orders", {
        token: readToken(),
      });
      ordState = { list: raw, loaded: true, error: null };
    } catch (e) {
      ordState = {
        list: ordState.list,
        loaded: true,
        error: errMsg(e, "No se pudieron cargar los pedidos."),
      };
    } finally {
      ordLoading = null;
      ordListeners.forEach((l) => l());
    }
  })();
  return ordLoading;
}

function subscribeOrders(cb: () => void) {
  ordListeners.add(cb);
  if (!ordState.loaded) void loadOrders();
  return () => {
    ordListeners.delete(cb);
  };
}

function useOrdState(): OrdState {
  return useSyncExternalStore(
    subscribeOrders,
    () => ordState,
    () => ORD_SERVER,
  );
}

/** Descarga la boleta PDF de un pedido (endpoint admin, respuesta binaria). */
async function downloadOrderReceiptPdf(
  id: string,
  orderNumber: string,
): Promise<Result> {
  try {
    // `apiFetch` parsea texto/JSON; para el PDF hace falta `fetch` directo.
    const res = await fetch(`${API_URL}/api/orders/${id}/receipt-pdf`, {
      headers: { Authorization: `Bearer ${readToken() ?? ""}` },
    });
    if (!res.ok) {
      let msg = `Error ${res.status}`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body?.error) msg = body.error;
      } catch {
        /* respuesta no-JSON */
      }
      return { ok: false, error: msg };
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boleta-${orderNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo descargar la boleta." };
  }
}

/** Lista de pedidos + cambio de estado (panel admin). */
export function useAdminOrders() {
  const state = useOrdState();

  const setStatus = useCallback(
    async (id: string, status: OrderStatus): Promise<Result> => {
      try {
        await apiFetch(`/api/orders/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
          token: readToken(),
        });
        await loadOrders(true);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "No se pudo actualizar el estado.") };
      }
    },
    [],
  );

  const deleteOrder = useCallback(async (id: string): Promise<Result> => {
    try {
      await apiFetch(`/api/orders/${id}`, {
        method: "DELETE",
        token: readToken(),
      });
      await loadOrders(true);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e, "No se pudo eliminar el pedido.") };
    }
  }, []);

  return {
    orders: state.list,
    ready: state.loaded,
    error: state.error,
    reload: () => loadOrders(true),
    setStatus,
    deleteOrder,
    // función estable a nivel de módulo, no necesita useCallback
    downloadReceiptPdf: downloadOrderReceiptPdf,
  };
}

// ===========================================================================
// Auth admin (JWT real)
// ===========================================================================

export type AdminUser = { id: string; email: string; name: string; role: string };

type AuthState = { token: string | null; user: AdminUser | null; checked: boolean };

let authState: AuthState = {
  token: readToken(),
  user: null,
  checked: false,
};
const AUTH_SERVER: AuthState = { token: null, user: null, checked: false };
const authListeners = new Set<() => void>();
let authInit = false;

function emitAuth() {
  authListeners.forEach((l) => l());
}

function clearSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
  authState = { token: null, user: null, checked: true };
  emitAuth();
}

function subscribeAuth(cb: () => void) {
  authListeners.add(cb);
  if (!authInit) {
    authInit = true;
    const token = authState.token;
    if (!token) {
      authState = { ...authState, checked: true };
      emitAuth();
    } else {
      // Optimista: se considera autenticado ya; validamos en segundo plano.
      authState = { ...authState, checked: true };
      emitAuth();
      apiFetch<AdminUser>("/api/auth/me", { token })
        .then((user) => {
          authState = { ...authState, user };
          emitAuth();
        })
        .catch((e) => {
          if (e instanceof ApiError && e.status === 401) clearSession();
        });
    }
  }
  return () => {
    authListeners.delete(cb);
  };
}

export function useAdminAuth() {
  const state = useSyncExternalStore(
    subscribeAuth,
    () => authState,
    () => AUTH_SERVER,
  );

  const isAuthenticated: boolean | null = !state.checked
    ? null
    : Boolean(state.token);

  const login = useCallback(
    async (email: string, password: string): Promise<Result> => {
      try {
        const { token, user } = await apiFetch<{ token: string; user: AdminUser }>(
          "/api/auth/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          },
        );
        if (typeof window !== "undefined")
          window.localStorage.setItem(TOKEN_KEY, token);
        authState = { token, user, checked: true };
        emitAuth();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "No se pudo iniciar sesión.") };
      }
    },
    [],
  );

  const logout = useCallback(() => clearSession(), []);

  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
    ): Promise<Result> => {
      try {
        await apiFetch("/api/auth/password", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
          token: readToken(),
        });
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "No se pudo cambiar la contraseña.") };
      }
    },
    [],
  );

  return {
    isAuthenticated,
    user: state.user,
    token: state.token,
    login,
    logout,
    changePassword,
  };
}
