import { api } from "@/lib/api/client";
import { cachedFetch } from "@/lib/api-cache";
import type { ApiEnvelope } from "@/types/auth";
import type { HeroSection } from "@/types/hero";

/**
 * Fetch hero section data from GET /api/v1/cms/homepage/hero-section/
 * Returns hero content including titles, description, image, and stats.
 */
export async function fetchHeroSection(): Promise<HeroSection> {
  return cachedFetch("hero-section", async () => {
    const response = await api.get<ApiEnvelope<HeroSection>>(
      "/api/v1/cms/homepage/hero-section/",
      {
        // Render's free tier can take a while on a cold start.
        timeout: 60_000,
      },
    );

    return response.data;
  });
}
