import { api } from "@/lib/api/client";
import { cachedFetch } from "@/lib/api-cache";
import type { ApiEnvelope } from "@/types/auth";
import type { WhyUsSection } from "@/types/why-us";

/**
 * Fetch why us section data from GET /api/v1/cms/homepage/why-us/
 * Returns why us content including title, description, and features with icons.
 */
export async function fetchWhyUsSection(): Promise<WhyUsSection> {
  return cachedFetch("why-us-section", async () => {
    const response = await api.get<ApiEnvelope<WhyUsSection>>(
      "/api/v1/cms/homepage/why-us/",
      {
        // Render's free tier can take a while on a cold start.
        timeout: 60_000,
      },
    );

    return response.data;
  });
}
