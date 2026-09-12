import { api } from "@/lib/api/client";
import { cachedFetch } from "@/lib/api-cache";
import type { ApiEnvelope } from "@/types/auth";
import type { PaginatedTestimonials, Testimonial } from "@/types/testimonial";

/**
 * Fetch all active testimonials from GET /api/v1/cms/testimonials/
 * Returns only active testimonials, sorted by sort_order.
 */
export async function fetchTestimonials(): Promise<Testimonial[]> {
  return cachedFetch("testimonials", async () => {
    const response = await api.get<ApiEnvelope<PaginatedTestimonials>>(
      "/api/v1/cms/testimonials/",
      {
        // Render's free tier can take a while on a cold start.
        timeout: 60_000,
      },
    );

    // Return only active testimonials, already sorted by backend
    return response.data.results.filter((t) => t.is_active);
  });
}
