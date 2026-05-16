"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  listing_id: string;
  vendor_id: string;
  vendor_name: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
  image_url?: string | null;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  inc: (listing_id: string) => void;
  dec: (listing_id: string) => void;
  remove: (listing_id: string) => void;
  clear: () => void;
  clearVendor: (vendor_id: string) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.listing_id === item.listing_id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.listing_id === item.listing_id ? { ...i, qty: i.qty + 1 } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, qty: 1 }] };
        }),
      inc: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.listing_id === id ? { ...i, qty: i.qty + 1 } : i,
          ),
        })),
      dec: (id) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.listing_id === id ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.listing_id !== id) })),
      clear: () => set({ items: [] }),
      clearVendor: (vid) =>
        set((s) => ({ items: s.items.filter((i) => i.vendor_id !== vid) })),
    }),
    {
      name: "mayfield-cart",
      storage: createJSONStorage(() => localStorage),
      // Hydrate gracefully — Next.js SSR safe
      skipHydration: false,
    },
  ),
);

/**
 * Group cart items by vendor. Each cart sub-total reflects one vendor's
 * line items only — orders are created per-vendor.
 */
export function groupByVendor(items: CartItem[]) {
  const map = new Map<string, { vendor_name: string; items: CartItem[]; subtotal: number }>();
  for (const item of items) {
    const entry = map.get(item.vendor_id) ?? {
      vendor_name: item.vendor_name,
      items: [],
      subtotal: 0,
    };
    entry.items.push(item);
    entry.subtotal += item.price * item.qty;
    map.set(item.vendor_id, entry);
  }
  return Array.from(map.entries()).map(([vendor_id, value]) => ({
    vendor_id,
    ...value,
  }));
}
