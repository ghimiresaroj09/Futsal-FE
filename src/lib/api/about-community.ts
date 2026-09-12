import { api } from "@/lib/api/client";
import { cachedFetch } from "@/lib/api-cache";
import type { ApiEnvelope } from "@/types/auth";
import type { AboutCommunitySection } from "@/types/about-community";

/**
 * Fetch about community section data from GET /api/v1/cms/about/community/
 * Returns community content including title, description, image, features, team, and rules.
 */
export async function fetchAboutCommunitySection(): Promise<AboutCommunitySection> {
  return cachedFetch("about-community-section", async () => {
    const response = await api.get<ApiEnvelope<AboutCommunitySection>>(
      "/api/v1/cms/about/community/",
      {
        // Render's free tier can take a while on a cold start.
        timeout: 60_000,
      },
    );

    return response.data;
  });
}
