/**
 * Simple in-memory cache for API responses to prevent duplicate requests
 * during React StrictMode double-rendering in development.
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();

// Cache duration: 30 seconds
const CACHE_DURATION = 30_000;

/**
 * Wraps an API call with caching logic.
 * Returns cached data if available and fresh, otherwise makes the API call.
 * Prevents duplicate concurrent requests for the same key.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_DURATION,
): Promise<T> {
  const now = Date.now();

  // Check if we have a fresh cached response
  const cached = cache.get(key) as CacheEntry<T> | undefined;
  if (cached && now - cached.timestamp < ttl) {
    return cached.data;
  }

  // Check if there's already a pending request for this key
  const pending = pendingRequests.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  // Make the request
  const promise = fetcher()
    .then((data) => {
      // Cache the successful response
      cache.set(key, { data, timestamp: now });
      pendingRequests.delete(key);
      return data;
    })
    .catch((error) => {
      // Don't cache errors, just remove from pending
      pendingRequests.delete(key);
      throw error;
    });

  // Store the pending promise
  pendingRequests.set(key, promise);

  return promise;
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear();
  pendingRequests.clear();
}

/**
 * Clear specific cache entry
 */
export function clearCacheKey(key: string): void {
  cache.delete(key);
  pendingRequests.delete(key);
}
