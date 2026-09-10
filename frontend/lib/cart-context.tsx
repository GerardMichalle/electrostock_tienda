"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type CartItem = {
  /** id del producto en la base — necesario para enviar el pedido a la API. */
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  categorySlug: string;
  subcategorySlug: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (slug: string) => void;
  updateQty: (slug: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "electro_cart";

/**
 * Tope de unidades por producto. No hay stock numérico en el modelo (solo el
 * enum EN_STOCK/AGOTADO), así que es un límite fijo y razonable: quien quiera
 * comprar más cantidad coordina por WhatsApp. También frena que se infle el
 * carrito a fuerza de clics en "+".
 */
export const CART_MAX_QTY = 99;

const clampQty = (n: number) =>
  Math.min(CART_MAX_QTY, Math.max(1, Math.floor(n) || 1));

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Hidratamos el carrito desde localStorage una sola vez tras el montaje
  // (no en el initializer de useState para evitar desajustes de hidratación).
  useEffect(() => {
    let stored: CartItem[] = [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CartItem[];
        // Descarta ítems de un carrito viejo sin productId (antes del backend)
        // y sanea la cantidad (carritos inflados de antes del tope).
        stored = Array.isArray(parsed)
          ? parsed
              .filter((i) => i && typeof i.productId === "string")
              .map((i) => ({ ...i, qty: clampQty(i.qty) }))
          : [];
      } catch {
        stored = [];
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial puntual
    setItems(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, ready]);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug ? { ...i, qty: clampQty(i.qty + qty) } : i
        );
      }
      return [...prev, { ...item, qty: clampQty(qty) }];
    });
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const updateQty = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.slug === slug ? { ...i, qty: clampQty(qty) } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        ready,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
