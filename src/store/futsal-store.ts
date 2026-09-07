import { create } from "zustand";

import { api } from "@/lib/api/client";
import type { Futsal } from "@/types/futsal";
import type { ApiEnvelope } from "@/types/auth";

/**
 * The arena record from GET /api/v1/futsal/ — the single source of truth
 * for name, contact details, pricing baseline and opening hours across
 * the site. Loaded once per session by PublicLayout; components read it
 * here and fall back to sensible defaults while (or if) it loads.
 */
interface FutsalState {
  futsal: Futsal | null;
  loading: boolean;
  /** True once a fetch finished (ok or failed) — enables fallbacks. */
  settled: boolean;
  loadFutsal: () => Promise<void>;
}

export const useFutsalStore = create<FutsalState>()((set, get) => ({
  futsal: null,
  loading: false,
  settled: false,
  loadFutsal: async () => {
    // Single-flight: PublicLayout mounts once, but guards + retries may
    // call this again — never fire a second request while one is running
    // or after a success.
    if (get().loading || get().futsal) return;

    set({ loading: true });
    try {
      const response = await api.get<ApiEnvelope<Futsal>>(
        "/api/v1/futsal/",
        // Render's free tier can take a while on a cold start.
        { timeout: 60_000 },
      );
      set({ futsal: response.data, loading: false, settled: true });
    } catch {
      // Site copy falls back to its built-in defaults — the arena info
      // is enhancement, not a blocker.
      set({ loading: false, settled: true });
    }
  },
}));

/** Opening/closing hours as slot-engine numbers (6, 22) — null until loaded. */
export function futsalHours(
  futsal: Futsal | null,
): { open: number; close: number } | null {
  if (!futsal) return null;
  const open = Number(futsal.opening_time.slice(0, 2));
  const close = Number(futsal.closing_time.slice(0, 2));
  if (!Number.isFinite(open) || !Number.isFinite(close) || close <= open)
    return null;
  return { open, close };
}
