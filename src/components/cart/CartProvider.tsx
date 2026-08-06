"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types/cart";

const STORAGE_KEY = "ferrum-cart-v1";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  removeItem: (productId: string, size: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function isStoredCart(value: unknown): value is CartItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.productId === "string" &&
        typeof item.size === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    )
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isStoredCart(parsed)) setItems(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const addItem = useCallback((incoming: CartItem) => {
    setItems((current) => {
      const index = current.findIndex(
        (item) => item.productId === incoming.productId && item.size === incoming.size
      );
      if (index === -1) return [...current, incoming];

      return current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, quantity: Math.min(item.quantity + incoming.quantity, incoming.availableStock) }
          : item
      );
    });
  }, []);

  const setQuantity = useCallback((productId: string, size: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.availableStock, 10)) }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId || item.size !== size)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotalCents = items.reduce(
    (total, item) => total + item.unitPriceCents * item.quantity,
    0
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotalCents,
      hydrated,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotalCents, hydrated, addItem, setQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
