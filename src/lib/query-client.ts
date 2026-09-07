import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client with sensible defaults:
 * - 30s stale time so navigation doesn't hammer the API
 * - 1 retry (network blips) instead of the default 3
 * - no refetch on window focus (less surprising UX)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
