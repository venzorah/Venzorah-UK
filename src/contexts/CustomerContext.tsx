import React, { createContext, useContext, useMemo } from "react";
import { usePersistentState } from "../hooks/usePersistentState";
import { useAuth } from "./AuthContext";
import type { SavedAddress } from "../types/marketplace";

interface CustomerData {
  wishlist: string[]; // product or service ids
  addresses: SavedAddress[];
}

interface CustomerState extends CustomerData {
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => boolean; // returns new saved state
  saveAddress: (address: Omit<SavedAddress, "id"> & {id?: string;}) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const CustomerContext = createContext<CustomerState | null>(null);

const seed: Record<string, CustomerData> = {
  "u-customer": {
    wishlist: ["p-egusi", "s-knotless"],
    addresses: [{ id: "addr-1", label: "Home", name: "Chioma Okafor", line1: "18 Calthorpe Road", city: "Birmingham", postcode: "B15 1QT", isDefault: true }]
  }
};

export function CustomerProvider({ children }: {children: React.ReactNode;}) {
  const { user } = useAuth();
  const [store, setStore] = usePersistentState<Record<string, CustomerData>>("vz-customer-v1", seed);

  const value = useMemo<CustomerState>(() => {
    const key = user?.id ?? "guest";
    const data = store[key] ?? { wishlist: [], addresses: [] };
    const write = (fn: (d: CustomerData) => CustomerData) => setStore((s) => ({ ...s, [key]: fn(s[key] ?? { wishlist: [], addresses: [] }) }));
    return {
      ...data,
      isSaved: (id) => data.wishlist.includes(id),
      toggleSaved: (id) => {
        const saved = !data.wishlist.includes(id);
        write((d) => ({ ...d, wishlist: saved ? [...d.wishlist, id] : d.wishlist.filter((x) => x !== id) }));
        return saved;
      },
      saveAddress: (address) =>
      write((d) => {
        const id = address.id ?? `addr-${Date.now()}`;
        const isDefault = address.isDefault || d.addresses.length === 0;
        const rest = d.addresses.filter((a) => a.id !== id).map((a) => isDefault ? { ...a, isDefault: false } : a);
        return { ...d, addresses: [...rest, { ...address, id, isDefault }] };
      }),
      removeAddress: (id) =>
      write((d) => {
        const left = d.addresses.filter((a) => a.id !== id);
        if (left.length && !left.some((a) => a.isDefault)) left[0] = { ...left[0], isDefault: true };
        return { ...d, addresses: left };
      }),
      setDefaultAddress: (id) => write((d) => ({ ...d, addresses: d.addresses.map((a) => ({ ...a, isDefault: a.id === id })) }))
    };
  }, [user, store, setStore]);

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer(): CustomerState {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used inside CustomerProvider");
  return ctx;
}