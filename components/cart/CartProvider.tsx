"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  sku?: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  hasItem: (productId: string) => boolean;
};

const cartStorageKey = "rockin-rare-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(cartStorageKey) || "[]") as CartItem[];
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

function writeStoredCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
}

function isCartItem(value: unknown): value is CartItem {
  const item = value as Partial<CartItem>;
  return (
    typeof item?.id === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.imageUrl === "string"
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredCart(items);
  }, [hydrated, items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => (current.some((candidate) => candidate.id === item.id) ? current : [...current, item]));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    writeStoredCart([]);
    setItems((current) => (current.length > 0 ? [] : current));
  }, []);

  const hasItem = useCallback((productId: string) => items.some((item) => item.id === productId), [items]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      count: items.length,
      subtotal: items.reduce((total, item) => total + item.price, 0),
      addItem,
      removeItem,
      clearCart,
      hasItem
    };
  }, [addItem, clearCart, hasItem, items, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return value;
}
