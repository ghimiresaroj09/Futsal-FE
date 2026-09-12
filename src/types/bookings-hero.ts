/** Bookings hero section from GET /api/v1/cms/bookings/hero-section/ */
export interface BookingsHeroInfo {
  title: string;
  iconcode: string;
  description: string;
}

export interface BookingsHeroSection {
  title: string;
  description: string;
  image_url: string;
  info: BookingsHeroInfo[];
  updated_at: string;
}
