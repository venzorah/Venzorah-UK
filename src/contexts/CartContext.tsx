import React, { createContext, useContext, useMemo } from "react";
import { usePersistentState } from "../hooks/usePersistentState";
import type { CartLine } from "../types/marketplace";

interface CartState {
  lines: CartLine[];
  count: number;
  postcode: string;
  selectedMethods: Record<string, string>;
  add: (line: CartLine, maxStock: number) => void;
  setQty: (variantId: string, qty: number, maxStock: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setPostcode: (pc: string) => void;
  selectMethod: (vendorId: string, methodId: string) => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: {children: React.ReactNode;}) {
  const [lines, setLines] = usePersistentState<CartLine[]>("vz-cart-lines-v3", [], "session");
  const [postcode, setPostcode] = usePersistentState("vz-cart-postcode-v3", "B15 2TT", "session");
  const [selectedMethods, setSelectedMethods] = usePersistentState<Record<string, string>>("vz-cart-methods-v3", {}, "session");

  const value = useMemo<CartState>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      postcode,
      selectedMethods,
      add: (line, maxStock) =>
      setLines((ls) => {
        const existing = ls.find((l) => l.variantId === line.variantId);
        if (existing) return ls.map((l) => l.variantId === line.variantId ? { ...l, qty: Math.min(maxStock, l.qty + line.qty) } : l);
        return [...ls, { ...line, qty: Math.min(maxStock, line.qty) }];
      }),
      setQty: (variantId, qty, maxStock) =>
      setLines((ls) => ls.map((l) => l.variantId === variantId ? { ...l, qty: Math.max(1, Math.min(maxStock, qty)) } : l)),
      remove: (variantId) => setLines((ls) => ls.filter((l) => l.variantId !== variantId)),
      clear: () => {
        setLines([]);
        setSelectedMethods({});
      },
      setPostcode,
      selectMethod: (vendorId, methodId) => setSelectedMethods((m) => ({ ...m, [vendorId]: methodId }))
    }),
    [lines, postcode, selectedMethods]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}