import { api } from "@/lib/api/client";
import { cachedFetch } from "@/lib/api-cache";
import type { ApiEnvelope } from "@/types/auth";
import type { PaginatedCarouselImages, CarouselImage } from "@/types/carousel";

/**
 * Fetch carousel images from GET /api/v1/cms/homepage/carousel/
 * Returns only active carousel images, sorted by sort_order.
 */
export async function fetchCarouselImages(): Promise<CarouselImage[]> {
  return cachedFetch("carousel-images", async () => {
    const response = await api.get<ApiEnvelope<PaginatedCarouselImages>>(
      "/api/v1/cms/homepage/carousel/",
      {
        // Render's free tier can take a while on a cold start.
        timeout: 60_000,
      },
    );

    // Return only active images, already sorted by backend
    return response.data.results.filter((img) => img.is_active);
  });
}
