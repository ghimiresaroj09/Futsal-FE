/** About story section from GET /api/v1/cms/about/story/ */
export interface AboutStoryJourney {
  year: string;
  image: string;
  title: string;
  description: string;
}

export interface AboutStorySection {
  title: string;
  description: string;
  image_url: string;
  journey: AboutStoryJourney[];
  updated_at: string;
}
