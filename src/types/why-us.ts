/** Why Us section from GET /api/v1/cms/homepage/why-us/ */
export interface WhyUsFeature {
  title: string;
  iconcode: string;
  description: string;
}

export interface WhyUsSection {
  title: string;
  description: string;
  features: WhyUsFeature[];
  updated_at: string;
}
