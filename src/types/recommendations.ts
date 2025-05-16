
export interface RecommendationHeroConfig {
  headline: string;
  subHeadline?: string; // Making subHeadline optional
  ctaText: string;
  uniqueValueProposition?: string; // For display in the hero section or nearby
}

export interface RecommendationBenefit {
  icon?: string; // Placeholder for icon name or SVG path
  title: string;
  description: string;
}

export interface RecommendationTestimonial {
  name: string;
  location?: string;
  avatar?: string; // Placeholder for avatar initial or image path
  quote: string;
  since?: string; // e.g., "Protected since 2022"
}

export interface RecommendationFormConfig {
    headline: string;
    ctaText: string;
}

export interface PageBlueprint {
  pageName: string; // A user-friendly name for this set of recommendations/blueprint
  seoTitle?: string; // For the <title> tag
  heroConfig?: RecommendationHeroConfig;
  benefits?: RecommendationBenefit[];
  testimonials?: RecommendationTestimonial[];
  formConfig?: RecommendationFormConfig;
  // Potentially add other sections like 'awards' or 'valuePropositions'
  // The structure should align with what your scraping tool provides
}
