import { useCallback, useState } from "react";
import type { SetStateAction } from "react";

/**
 * useState backed by localStorage (JSON-serialised). SSR/quota-safe:
 * falls back to in-memory state if storage is unavailable.
 *
 * const [density, setDensity] = useLocalStorage("table-density", "comfortable")
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item === null ? initialValue : (JSON.parse(item) as T);
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: SetStateAction<T>) => {
      setStored((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // storage full / disabled — keep in-memory state anyway
        }
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setStored(initialValue);
  }, [key, initialValue]);

  return [stored, setValue, remove] as const;
}
