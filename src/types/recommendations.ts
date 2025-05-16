
export interface RecommendationHeroConfig {
  headline: string;
  subHeadline?: string; // e.g., "(even when you can't be there for them)"
  ctaText: string; // e.g., "Secure My Family's Future Now"
  uniqueValueProposition?: string; // e.g., "Only Real Insurance gives you The Real Reward™..."
  // Consider if imageUrls or background video links specific to the hero might come from the blueprint
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
  type: 'award' | 'rating' | 'statistic' | 'badge' | 'text'; // 'text' for general trust statements
  text: string; // Main text, e.g., "Winner of Roy Morgan Customer Satisfaction Award 2022-2023"
  source?: string; // e.g., "Roy Morgan", "Feefo"
  details?: string; // Additional details, e.g., "Risk & Life Insurer of the Year - 2023" or "from 5,656 Feefo reviews"
  imageUrl?: string; // For award logos or visual badges
}

export interface RecommendationFormConfig {
    headline: string; // e.g., "Get Your Personalized Protection Plan in 60 Seconds"
    ctaText: string; // e.g., "Secure My Family's Future"
    // Could also include recommended form fields or steps if the blueprint goes that deep
}

// Represents the overall structure of the JSON blueprint uploaded in Step 1
export interface PageBlueprint {
  pageName: string; // A user-friendly name for this set of recommendations/blueprint, e.g., "Life Insurance Landing Page - Variant X"
  targetUrl?: string; // The URL this blueprint is for, e.g., "https://www.realinsurance.com.au/lp/life-form"
  seoTitle?: string; // For the <title> tag of the generated page
  
  heroConfig?: RecommendationHeroConfig;
  benefits?: RecommendationBenefit[];
  testimonials?: RecommendationTestimonial[];
  trustSignals?: RecommendationTrustSignal[]; // For awards, ratings, etc.
  formConfig?: RecommendationFormConfig;
  
  // Potentially add other distinct content sections if your scraping tool provides them:
  // e.g., productFeatures?: RecommendationProductFeature[];
  // e.g., comparisonTable?: RecommendationComparisonTableData;

  // General notes or summary from the analysis, if useful to display in the tool
  executiveSummary?: string; 
  keyRecommendationsSummary?: string; // A brief summary of top 2-3 proposed changes
}
