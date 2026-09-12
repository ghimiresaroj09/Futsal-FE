/** About community section from GET /api/v1/cms/about/community/ */
export interface AboutCommunityTeam {
  name: string;
  role: string;
  image: string;
}

export interface AboutCommunityRule {
  title: string;
  iconcode: string;
  description: string;
}

export interface AboutCommunitySection {
  title: string;
  description: string;
  image_url: string;
  features: string[];
  team: AboutCommunityTeam[];
  rules: AboutCommunityRule[];
  updated_at: string;
}
