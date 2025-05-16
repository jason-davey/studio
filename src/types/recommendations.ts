
export interface RecommendationHeroConfig {
  headline: string;
  subHeadline?: string; // e.g., "(even when you can't be there for them)"
  ctaText: string; // e.g., "Secure My Family's Future Now"
  uniqueValueProposition?: string; // e.g., "Only Real Insurance gives you The Real Reward™..."
  heroImageUrl?: string;
  heroImageAltText?: string;
}

export interface RecommendationBenefit {
  icon?: string; // Suggests an icon (e.g., "Clock", "FileText" from lucide-react, or an SVG path)
  title: string; // e.g., "Speedy Application"
  description: string; // e.g., "Apply in minutes over the phone..."
}

export interface RecommendationTestimonial {
  name: string; // e.g., "Sarah T."
  location?: string; // e.g., "Melbourne"
  avatarInitial?: string; // e.g., "ST" (if no image)
  avatarImageUrl?: string; // URL for the avatar image
  quote: string; // The testimonial text
  since?: string; // e.g., "Protected since 2022"
}

export interface RecommendationTrustSignal {
  type: 'award' | 'rating' | 'statistic' | 'badge' | 'text';
  text: string;
  source?: string;
  details?: string;
  imageUrl?: string; // For award logos or visual badges
}

export interface RecommendationFormConfig {
  headline: string; // e.g., "Get Your Personalized Protection Plan in 60 Seconds"
  ctaText: string; // e.g., "Secure My Family's Future"
}

// Represents the overall structure of the JSON blueprint uploaded in Step 1
export interface PageBlueprint {
  pageName: string; // A user-friendly name for this set of recommendations/blueprint, e.g., "Life Insurance Landing Page - Variant X"
  targetUrl?: string; // The URL this blueprint is for, e.g., "https://www.realinsurance.com.au/lp/life-form"
  seoTitle?: string; // For the <title> tag of the generated page
  executiveSummary?: string;
  keyRecommendationsSummary?: string;
  
  heroConfig?: RecommendationHeroConfig;
  benefits?: RecommendationBenefit[];
  testimonials?: RecommendationTestimonial[];
  trustSignals?: RecommendationTrustSignal[];
  formConfig?: RecommendationFormConfig;
}
