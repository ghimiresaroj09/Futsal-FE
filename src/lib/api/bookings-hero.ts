import { api } from "@/lib/api/client";
import { cachedFetch } from "@/lib/api-cache";
import type { ApiEnvelope } from "@/types/auth";
import type { BookingsHeroSection } from "@/types/bookings-hero";

/**
 * Fetch bookings hero section data from GET /api/v1/cms/bookings/hero-section/
 * Returns hero content including title, description, image, and info cards.
 */
export async function fetchBookingsHeroSection(): Promise<BookingsHeroSection> {
  return cachedFetch("bookings-hero-section", async () => {
    const response = await api.get<ApiEnvelope<BookingsHeroSection>>(
      "/api/v1/cms/bookings/hero-section/",
      {
        // Render's free tier can take a while on a cold start.
        timeout: 60_000,
      },
    );

    return response.data;
  });
}
