/** Testimonial from GET /api/v1/cms/testimonials/ */
export interface Testimonial {
  id: string;
  full_name: string;
  title: string;
  image_url: string;
  content: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** DRF-style paginated envelope: { count, next, previous, results }. */
export interface PaginatedTestimonials {
  count: number;
  next: string | null;
  previous: string | null;
  results: Testimonial[];
}
