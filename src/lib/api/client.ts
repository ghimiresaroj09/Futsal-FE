import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";

import { appConfig } from "@/config";
import { ApiError } from "@/lib/api/error";
import { jwtExpiry } from "@/lib/cookies";
import { readAccessToken, readRefreshToken } from "@/lib/tokens";
import { useAuthStore } from "@/store/auth-store";
import type { ApiEnvelope, RefreshData } from "@/types/auth";

/**
 * Pre-configured axios instance for the backend.
 * - Bearer token attached automatically (tokens live in cookies)
 * - An expired/expiring access token is rotated BEFORE the request goes
 *   out (silent /auth/refresh + cookie swap) — most calls never 401
 * - Any 401 that still slips through is retried once after a refresh
 * - Errors normalised to `ApiError`; unrecoverable 401s clear the session
 */
export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeoutMs,
  headers: { "Content-Type": "application/json" },
});

const REFRESH_PATH = "/api/v1/auth/refresh/";
/** Refresh this many ms before the access token actually expires. */
const REFRESH_AHEAD_MS = 30_000;

/** Auth endpoints where a 401 is a business error, not a dead session. */
const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

/** Tell the user why they suddenly have to log in again (once per expiry). */
function announceSessionExpiry(reason: string) {
  console.error(`[auth] session ended: ${reason}`);
  toast.error("Session expired", { description: reason });
}

/** The login server was unreachable — session kept, user can simply retry. */
function announceRefreshUnreachable(reason: string) {
  console.error(`[auth] refresh failed without rejecting the token: ${reason}`);
  toast.error("Couldn't reach the login server", {
    description: "Your session is fine — please try again in a moment.",
  });
}

/**
 * Rotate tokens. Refresh tokens are SINGLE-USE and shared across tabs via
 * cookies, so this reads the freshest refresh token from the cookie jar
 * (not in-memory state, which can be stale in other tabs) — and when the
 * backend rejects one because ANOTHER tab already rotated it, it retries
 * once with the cookie's newest value instead of killing the session.
 */
async function rotateTokens(depth = 0): Promise<string> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  // Freshest value across tabs and token homes (cookie first, mirror
  // fallback) — never a stale in-memory copy.
  const attempted = readRefreshToken() ?? refreshToken;

  if (!attempted) {
    logout();
    announceSessionExpiry("No refresh token — please log in again.");
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  try {
    // Raw axios on purpose — this call must never pass through the
    // interceptors above (no recursion, no stale Bearer header).
    const response = await axios.post<ApiEnvelope<RefreshData>>(
      REFRESH_PATH,
      { refresh: attempted },
      // Render's free tier can take a while on a cold start.
      { timeout: 90_000 },
    );
    // The backend rotates BOTH tokens — persist the new pair (cookies
    // included, via the store).
    setTokens(response.data.data.access, response.data.data.refresh);
    return response.data.data.access;
  } catch (error) {
    const apiError = ApiError.from(error);
    const rejected =
      apiError.status !== null &&
      apiError.status >= 400 &&
      apiError.status < 500;

    if (rejected) {
      // Another open tab may have rotated the shared token while we were
      // in flight — if a fresher token exists, retry once with it instead
      // of ending the session.
      const newest = readRefreshToken();
      if (depth === 0 && newest && newest !== attempted) {
        return rotateTokens(depth + 1);
      }
      logout();
      announceSessionExpiry(
        `Your session was renewed in another tab — please log in again. (${apiError.status}: ${apiError.message})`,
      );
    } else {
      announceRefreshUnreachable(apiError.message);
    }
    throw apiError;
  }
}

/** In-flight refresh shared by concurrent callers (refresh tokens are single-use). */
let refreshInFlight: Promise<string> | null = null;

function sharedRotate(): Promise<string> {
  refreshInFlight ??= rotateTokens().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/**
 * True when the access token is missing or KNOWN to be near expiry.
 * An unparseable token is left alone — the server (and the reactive 401
 * retry) stays the source of truth, which avoids pathological refresh loops.
 */
function needsRefresh(token: string | null): boolean {
  if (!token) return true;
  const exp = jwtExpiry(token);
  return exp !== null && exp - Date.now() <= REFRESH_AHEAD_MS;
}

apiClient.interceptors.request.use(async (config) => {
  const store = useAuthStore.getState();
  const url = config.url ?? "";
  const isPublicAuthUrl = PUBLIC_AUTH_PATHS.some((path) => url.includes(path));

  // Do not let the client's JSON default turn FormData into JSON. Leaving
  // this header unset lets the browser attach the multipart boundary, which
  // is required for Django/DRF to receive uploaded files as actual files.
  if (
    typeof FormData !== "undefined" &&
    config.data instanceof FormData
  ) {
    config.headers.delete("Content-Type");
  }

  // The freshest token across tabs and token homes (cookie first, mirror
  // fallback) — never a stale in-memory copy.
  let token = readAccessToken() ?? store.token;

  // Proactive rotation: if the access token is expired/expiring and we
  // hold a refresh token, renew BEFORE the request so it never 401s.
  // NEVER for public auth endpoints (login must work with stale tokens
  // present — logging in is what replaces them) or the refresh itself.
  if (
    !isPublicAuthUrl &&
    url !== REFRESH_PATH &&
    store.refreshToken &&
    needsRefresh(token)
  ) {
    try {
      token = await sharedRotate();
    } catch {
      // Session is dead (announced in rotateTokens) — let the request
      // continue; the response interceptor or route guards handle it.
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const apiError = ApiError.from(error);
    const config = (error as AxiosError).config as
      | (AxiosRequestConfig & { _retried?: boolean })
      | undefined;
    const url = config?.url ?? "";

    const isPublicAuthUrl = PUBLIC_AUTH_PATHS.some((path) =>
      url.includes(path),
    );

    const canRetry =
      apiError.isUnauthorized &&
      config !== undefined &&
      !config._retried &&
      url !== REFRESH_PATH &&
      !isPublicAuthUrl;

    if (canRetry && config && useAuthStore.getState().refreshToken) {
      try {
        const token = await sharedRotate();
        config._retried = true;
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
        return apiClient.request(config);
      } catch {
        // Session already handled in rotateTokens; reject with the
        // original error below.
      }
    } else if (apiError.isUnauthorized && !isPublicAuthUrl) {
      // 401 on a private endpoint with no recovery path — end the session.
      const hadToken = Boolean(useAuthStore.getState().token);
      console.error(`[auth] 401 on ${url || "unknown"} — session cleared`);
      useAuthStore.getState().logout();
      if (hadToken)
        announceSessionExpiry(
          `Please log in again (auth failed on ${url || "unknown"}).`,
        );
    }

    return Promise.reject(apiError);
  },
);

/**
 * Thin typed helpers so components rarely touch axios directly.
 * With React Query: `queryFn: () => api.get<User>("/users/1")`
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get<T>(url, config).then((r) => r.data),

  post: <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> => apiClient.post<T>(url, body, config).then((r) => r.data),

  put: <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> => apiClient.put<T>(url, body, config).then((r) => r.data),

  patch: <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> => apiClient.patch<T>(url, body, config).then((r) => r.data),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete<T>(url, config).then((r) => r.data),
};
