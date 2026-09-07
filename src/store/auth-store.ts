import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  clearTokens,
  readAccessToken,
  readRefreshToken,
  writeTokens,
} from "@/lib/tokens";

/**
 * Shape of the logged-in user — mirrors the backend's `data.user` object:
 * { id, full_name, email, phone_number, profile_image, role, is_verified, created_at }
 */
export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  profile_image: string | null;
  role: string;
  is_verified: boolean;
  created_at?: string;
}

interface AuthState {
  /** Access token (JWT) — attached as `Authorization: Bearer …` by the api client. */
  token: string | null;
  /** Refresh token for renewing the access token when it expires. */
  refreshToken: string | null;
  user: AuthUser | null;
  /** Call after a successful login/token refresh. */
  setAuth: (
    token: string,
    refreshToken: string | null,
    user: AuthUser | null,
  ) => void;
  /** Rotate tokens after a silent refresh (user data is kept as-is). */
  setTokens: (token: string, refreshToken: string) => void;
  /** Update the user profile in place (e.g. after editing profile). */
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

/**
 * Auth session store.
 *
 * TOKENS live in cookies (real JWT lifetimes) with a localStorage mirror
 * as fallback — see src/lib/tokens.ts. Only the user profile is persisted
 * under "auth-session". When the access token expires, the api client
 * silently calls /auth/refresh and both homes are updated.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Hydrate synchronously from the token homes (cookie first).
      token: readAccessToken(),
      refreshToken: readRefreshToken(),
      user: null,
      setAuth: (token, refreshToken, user) => {
        writeTokens(token, refreshToken);
        set({ token, refreshToken, user });
      },
      setTokens: (token, refreshToken) => {
        writeTokens(token, refreshToken);
        set({ token, refreshToken });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        clearTokens();
        set({ token: null, refreshToken: null, user: null });
      },
    }),
    {
      name: "auth-session",
      version: 2,
      // Only the profile is persisted — tokens never live here.
      partialize: (state) => ({ user: state.user }) as unknown as AuthState,
      migrate: (persisted) =>
        ({
          user: (persisted as { user?: AuthUser })?.user ?? null,
        }) as unknown as AuthState,
    },
  ),
);
