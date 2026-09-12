import { api } from "@/lib/api/client";
import { cachedFetch } from "@/lib/api-cache";
import type { ApiEnvelope } from "@/types/auth";
import type {
  PaginatedGalleryImages,
  PaginatedGalleryCategories,
  PaginatedGalleryHighlights,
} from "@/types/gallery";

/**
 * Fetch gallery images from GET /api/v1/cms/gallery/images/
 * Supports pagination and category filtering.
 * @param params.page - Page number for pagination
 * @param params.category - Category UUID for filtering
 */
export async function fetchGalleryImages(params?: {
  page?: number;
  category?: string; // UUID
}): Promise<PaginatedGalleryImages> {
  const page = params?.page || 1;
  const category = params?.category || 'all';
  const cacheKey = `gallery-images-${page}-${category}`;

  return cachedFetch(cacheKey, async () => {
    const queryParams: Record<string, string | number> = {};
    
    if (params?.page) {
      queryParams.page = params.page;
    }
    
    if (params?.category) {
      queryParams.category = params.category;
    }

    const response = await api.get<ApiEnvelope<PaginatedGalleryImages>>(
      "/api/v1/cms/gallery/images/",
      {
        params: queryParams,
        timeout: 60_000,
      },
    );

    return response.data;
  });
}

/**
 * Fetch gallery categories from GET /api/v1/cms/gallery/category/
 * Returns list of active categories for filtering.
 */
export async function fetchGalleryCategories(): Promise<PaginatedGalleryCategories> {
  return cachedFetch("gallery-categories", async () => {
    const response = await api.get<ApiEnvelope<PaginatedGalleryCategories>>(
      "/api/v1/cms/gallery/category/",
      {
        timeout: 60_000,
      },
    );

    return response.data;
  });
}

/**
 * Fetch gallery highlights from GET /api/v1/cms/gallery/highlights/
 * Returns video highlights with thumbnails.
 */
export async function fetchGalleryHighlights(): Promise<PaginatedGalleryHighlights> {
  return cachedFetch("gallery-highlights", async () => {
    const response = await api.get<ApiEnvelope<PaginatedGalleryHighlights>>(
      "/api/v1/cms/gallery/highlights/",
      {
        timeout: 60_000,
      },
    );

    return response.data;
  });
}
