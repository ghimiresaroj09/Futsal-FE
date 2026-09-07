import { deleteCookie, getCookie, jwtExpiry, setCookie } from "@/lib/cookies";

/**
 * Token storage — cookies first (with the JWT's real lifetime), mirrored to
 * localStorage as a fallback because sandboxed iframe previews (like the
 * in-app preview pane) can block cookie writes entirely in some browsers.
 * Reads always prefer the freshest valid value from either home.
 */

const ACCESS_COOKIE = "nexus_access";
const REFRESH_COOKIE = "nexus_refresh";
const ACCESS_MIRROR = "nexus.tokens.access";
const REFRESH_MIRROR = "nexus.tokens.refresh";

/** Fallback cookie lifetimes when the JWT exp is unreadable. */
const ACCESS_MAX_AGE = 60 * 60 * 24; // 1 day (matches the backend's access token)
const REFRESH_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable — cookies still carry the tokens.
  }
}

function lsDelete(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

/** A token is usable only if it parses and isn't already expired. */
function alive(token: string | null): string | null {
  if (!token) return null;
  const exp = jwtExpiry(token);
  if (exp !== null && exp <= Date.now()) return null;
  return token;
}

export function readAccessToken(): string | null {
  return alive(getCookie(ACCESS_COOKIE)) ?? alive(lsGet(ACCESS_MIRROR));
}

export function readRefreshToken(): string | null {
  return alive(getCookie(REFRESH_COOKIE)) ?? alive(lsGet(REFRESH_MIRROR));
}

function maxAgeFromJwt(token: string, fallback: number): number {
  const exp = jwtExpiry(token);
  if (!exp) return fallback;
  return Math.max(30, Math.floor((exp - Date.now()) / 1000));
}

/** Persist both tokens to every home. */
export function writeTokens(access: string, refresh: string | null): void {
  setCookie(ACCESS_COOKIE, access, maxAgeFromJwt(access, ACCESS_MAX_AGE));
  lsSet(ACCESS_MIRROR, access);
  if (refresh) {
    setCookie(REFRESH_COOKIE, refresh, maxAgeFromJwt(refresh, REFRESH_MAX_AGE));
    lsSet(REFRESH_MIRROR, refresh);
  } else {
    deleteCookie(REFRESH_COOKIE);
    lsDelete(REFRESH_MIRROR);
  }
}

/** Remove the tokens from every home. */
export function clearTokens(): void {
  deleteCookie(ACCESS_COOKIE);
  deleteCookie(REFRESH_COOKIE);
  lsDelete(ACCESS_MIRROR);
  lsDelete(REFRESH_MIRROR);
}
