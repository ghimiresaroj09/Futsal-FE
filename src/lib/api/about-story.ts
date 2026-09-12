import { api } from "@/lib/api/client";
import { cachedFetch } from "@/lib/api-cache";
import type { ApiEnvelope } from "@/types/auth";
import type { AboutStorySection } from "@/types/about-story";

/**
 * Fetch about story section data from GET /api/v1/cms/about/story/
 * Returns story content including title, description, image, and journey timeline.
 */
export async function fetchAboutStorySection(): Promise<AboutStorySection> {
  return cachedFetch("about-story-section", async () => {
    const response = await api.get<ApiEnvelope<AboutStorySection>>(
      "/api/v1/cms/about/story/",
      {
        // Render's free tier can take a while on a cold start.
        timeout: 60_000,
      },
    );

    return response.data;
  });
}
