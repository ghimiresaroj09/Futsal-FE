/**
 * Tiny document.cookie helpers — the auth tokens live here (see auth-store).
 * Cookies carry the token's real JWT lifetime, so an expired access token
 * simply disappears from the cookie jar.
 */

export function setCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${Math.max(
    0,
    Math.floor(maxAgeSeconds),
  )}; SameSite=Lax${secure}`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/** Decode a JWT's `exp` claim into milliseconds — null when unreadable. */
export function jwtExpiry(token: string): number | null {
  try {
    const part = token.split(".")[1] ?? "";
    let base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    base64 += "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(base64)) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
