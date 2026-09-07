import { useCallback, useSyncExternalStore } from "react";

/**
 * Reactive media query, implemented with useSyncExternalStore
 * (no setState-in-effect, tear-free under concurrent rendering).
 *
 * const isDesktop = useMediaQuery("(min-width: 1024px)")
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Breakpoint helper matching Tailwind's `lg` (sidebar switches to drawer below it). */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
