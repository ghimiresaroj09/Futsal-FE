import { api } from "@/lib/api/client";
import { cachedFetch } from "@/lib/api-cache";
import type { ApiEnvelope } from "@/types/auth";
import type { ArenaSection } from "@/types/arena";

/**
 * Fetch arena section data from GET /api/v1/cms/homepage/arena/
 * Returns arena content including title, description, and features list.
 */
export async function fetchArenaSection(): Promise<ArenaSection> {
  return cachedFetch("arena-section", async () => {
    const response = await api.get<ApiEnvelope<ArenaSection>>(
      "/api/v1/cms/homepage/arena/",
      {
        // Render's free tier can take a while on a cold start.
        timeout: 60_000,
      },
    );

    return response.data;
  });
}
