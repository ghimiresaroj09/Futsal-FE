import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * Returns a ref; calls `onOutside` when a pointer-down lands outside it.
 *
 * const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))
 * <div ref={ref}>…</div>
 */
export function useClickOutside<T extends HTMLElement>(
  onOutside: () => void,
  enabled = true,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  // Keep the latest callback without re-subscribing listeners on every render.
  const callbackRef = useRef(onOutside);

  useEffect(() => {
    callbackRef.current = onOutside;
  });

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) {
        callbackRef.current();
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [enabled]);

  return ref;
}
