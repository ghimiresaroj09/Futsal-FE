import { api } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";

/**
 * Log out on the backend (blacklists the refresh token) and clear the
 * local session.
 *
 * The backend call is best-effort: local state is always cleared even if
 * the API call fails (network down, token already expired/blacklisted) —
 * a failed logout must never leave the user stuck signed in.
 */
export async function logoutEverywhere(): Promise<void> {
  const { refreshToken, logout } = useAuthStore.getState();

  if (refreshToken) {
    try {
      await api.post(
        "/api/v1/auth/logout/",
        { refresh: refreshToken },
        // Render's free tier can take a while on a cold start.
        { timeout: 60_000 },
      );
    } catch {
      // Swallowed on purpose — see the note above.
    }
  }

  logout();
}
