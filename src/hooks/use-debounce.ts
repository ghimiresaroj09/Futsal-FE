import { useEffect, useState } from "react";

/**
 * Returns a copy of `value` that only updates after it has been stable
 * for `delayMs`. Pair with SearchInput to avoid firing a request per keystroke.
 *
 * const debouncedQuery = useDebounce(query, 400)
 */
export function useDebounce<T>(value: T, delayMs = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
