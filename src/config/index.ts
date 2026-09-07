const env = import.meta.env;

if (!env.VITE_API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "[config] VITE_API_BASE_URL is not set — the default Render backend will be used by the proxy.",
  );
}

/**
 * Single source of truth for environment-derived configuration.
 * Never read import.meta.env directly from components — use this instead.
 */
export const appConfig = {
  appName: env.VITE_APP_NAME ?? "My App",
  // API requests stay same-origin. VITE_API_BASE_URL identifies the backend
  // origin for Vite locally and for the Vercel proxy at runtime.
  apiBaseUrl: "/",
  requestTimeoutMs: Number(env.VITE_REQUEST_TIMEOUT ?? 15_000),
} as const;
