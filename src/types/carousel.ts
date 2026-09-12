/** Carousel image from GET /api/v1/cms/homepage/carousel/ */
export interface CarouselImage {
  id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** DRF-style paginated envelope: { count, next, previous, results }. */
export interface PaginatedCarouselImages {
  count: number;
  next: string | null;
  previous: string | null;
  results: CarouselImage[];
}
