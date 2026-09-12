/** Hero section from GET /api/v1/cms/homepage/hero-section/ */
export interface HeroStat {
  label: string;
  value: string;
}

export interface HeroSection {
  title_one: string;
  title_two: string;
  description: string;
  image_url: string;
  stats: HeroStat[];
  updated_at: string;
}
