import { useCallback, useRef, useState } from "react";

type StorageKind = "local" | "session";
type SetValue<T> = (next: T | ((prev: T) => T)) => void;

const store = (kind: StorageKind): Storage | null => {
  try {
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
};

/**
 * useState backed by browser storage. Only used for non-sensitive demo data.
 * Writes happen synchronously inside the setter, so data is saved even if a full page
 * navigation starts in the same tick (e.g. "place order" followed by opening the confirmation page).
 */
export function usePersistentState<T>(key: string, initial: T, kind: StorageKind = "local") {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = store(kind)?.getItem(key);
      return raw ? JSON.parse(raw) as T : initial;
    } catch {
      return initial;
    }
  });
  const latest = useRef(value);

  const set = useCallback<SetValue<T>>(
    (next) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(latest.current) : next;
      latest.current = resolved;
      try {
        store(kind)?.setItem(key, JSON.stringify(resolved));
      } catch {

        // storage full or unavailable — keep in memory
      }setValue(resolved);
    },
    [key, kind]
  );

  return [value, set] as const;
}