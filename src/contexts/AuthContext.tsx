import React, { createContext, useContext, useMemo } from "react";
import { usePersistentState } from "../hooks/usePersistentState";
import { seedUsers, type User } from "../data/users";
import { useScreenInit } from "../useScreenInit.js";

type Result = {ok: true;user: User;} | {ok: false;error: string;};

interface AuthState {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Result;
  register: (input: {name: string;email: string;password: string;marketingConsent: boolean;}) => Result;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "phone" | "marketingConsent">>) => void;
  changePassword: (current: string, next: string) => {ok: boolean;error?: string;};
  promoteToVendor: (userId: string, vendorId: string) => void;
  userIdForVendor: (vendorId: string) => string | undefined;
}

const AuthContext = createContext<AuthState | null>(null);

const screenAccounts: Record<string, string | null> = {
  guest: null,
  customer: "u-customer",
  vendor: "u-ada",
  salon: "u-tola",
  admin: "u-admin"
};

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [users, setUsers] = usePersistentState<User[]>("vz-users-v1", seedUsers);
  const [storedSessionId, setSessionId] = usePersistentState<string | null>("vz-session-v1", null);
  // Screens previews pin a specific demo account (or signed-out) without touching the saved session.
  const screenInit = useScreenInit() as {as?: keyof typeof screenAccounts;};
  const sessionId = screenInit.as && screenInit.as in screenAccounts ? screenAccounts[screenInit.as] : storedSessionId;

  const value = useMemo<AuthState>(() => {
    const user = users.find((u) => u.id === sessionId) ?? null;
    return {
      user,
      users,
      login: (email, password) => {
        const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!found || found.password !== password) return { ok: false, error: "Email or password is incorrect." };
        setSessionId(found.id);
        return { ok: true, user: found };
      },
      register: ({ name, email, password, marketingConsent }) => {
        if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) return { ok: false, error: "An account with this email already exists." };
        const created: User = { id: `u-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), password, role: "customer", marketingConsent, createdAt: new Date().toISOString() };
        setUsers((us) => [...us, created]);
        setSessionId(created.id);
        return { ok: true, user: created };
      },
      logout: () => setSessionId(null),
      updateProfile: (patch) => setUsers((us) => us.map((u) => u.id === sessionId ? { ...u, ...patch } : u)),
      changePassword: (current, next) => {
        if (!user || user.password !== current) return { ok: false, error: "Current password is incorrect." };
        if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters." };
        setUsers((us) => us.map((u) => u.id === user.id ? { ...u, password: next } : u));
        return { ok: true };
      },
      promoteToVendor: (userId, vendorId) => setUsers((us) => us.map((u) => u.id === userId ? { ...u, role: "vendor", vendorId } : u)),
      userIdForVendor: (vendorId) => users.find((u) => u.vendorId === vendorId)?.id
    };
  }, [users, sessionId, setUsers, setSessionId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}