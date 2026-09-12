/** Gallery images from GET /api/v1/cms/gallery/images/ */
export interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  alt_text: string;
  category: string;
  category_name: string;
  category_slug: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedGalleryImages {
  count: number;
  next: string | null;
  previous: string | null;
  results: GalleryImage[];
}

/** Gallery categories from GET /api/v1/cms/gallery/category/ */
export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedGalleryCategories {
  count: number;
  next: string | null;
  previous: string | null;
  results: GalleryCategory[];
}

/** Gallery highlights from GET /api/v1/cms/gallery/highlights/ */
export interface GalleryHighlight {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  tags: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedGalleryHighlights {
  count: number;
  next: string | null;
  previous: string | null;
  results: GalleryHighlight[];
}
