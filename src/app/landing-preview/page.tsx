
'use client';

import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import TrustSignalsSection from '@/components/landing/TrustSignalsSection';
import QuoteFormSection from '@/components/landing/QuoteFormSection';
import Footer from '@/components/landing/Footer';
import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { PageBlueprint, RecommendationHeroConfig } from '@/types/recommendations';

const createDefaultHeroConfig = (versionLabel: string): RecommendationHeroConfig => ({
  headline: `Default Hero: Ensure Your Family's Financial Security (${versionLabel})`,
  subHeadline: `(default: even when you can't be there for them)`,
  ctaText: `Default: Secure My Family's Future`,
  uniqueValueProposition: "Only Real Insurance gives you The Real Reward™: 10% cash back after your first year, plus a free legal will valued at $160.",
  heroImageUrl: "https://placehold.co/1600x900.png",
  heroImageAltText: "Family enjoying time together"
});

export default function LandingPreviewPage() {
  const [heroConfigA, setHeroConfigA] = useState<RecommendationHeroConfig>(() => createDefaultHeroConfig('Version A - Fallback'));
  const [heroConfigB, setHeroConfigB] = useState<RecommendationHeroConfig>(() => createDefaultHeroConfig('Version B - Fallback'));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('LandingPreviewPage: useEffect for localStorage read (Hero-only) is running.');
    setIsLoading(true);
    setError(null);

    if (typeof window.localStorage === 'undefined') {
      console.error('LandingPreviewPage: window.localStorage is not available!');
      setError('Local storage is not available. Cannot load preview configurations.');
      setIsLoading(false);
      return;
    }
    console.log('LandingPreviewPage: window.localStorage is available.');

    let localHeroConfigAString: string | null = null;
    let localHeroConfigBString: string | null = null;

    try {
      localHeroConfigAString = localStorage.getItem('previewHeroConfigA_temp');
      console.log('LandingPreviewPage: Read previewHeroConfigA_temp from localStorage:', localHeroConfigAString ? localHeroConfigAString.substring(0,100) + "..." : localHeroConfigAString);

      localHeroConfigBString = localStorage.getItem('previewHeroConfigB_temp');
      console.log('LandingPreviewPage: Read previewHeroConfigB_temp from localStorage:', localHeroConfigBString ? localHeroConfigBString.substring(0,100) + "..." : localHeroConfigBString);

      // Immediately remove after reading for this simplified version too
      if (localHeroConfigAString) localStorage.removeItem('previewHeroConfigA_temp');
      if (localHeroConfigBString) localStorage.removeItem('previewHeroConfigB_temp');
      console.log('LandingPreviewPage: Temporary hero configs removed from localStorage.');

    } catch (e) {
      console.error("LandingPreviewPage: Error accessing localStorage:", e);
      setError("Could not access local storage. Displaying fallback versions.");
    }

    const parseAndSetHeroConfig = (
      heroString: string | null,
      setter: React.Dispatch<React.SetStateAction<RecommendationHeroConfig>>,
      versionLabel: string,
      fallbackConfig: RecommendationHeroConfig
    ) => {
      if (heroString && heroString.length > 10) { 
        try {
          const parsedHero = JSON.parse(heroString) as RecommendationHeroConfig;
          if (parsedHero.headline && parsedHero.ctaText) { // Basic check for hero config
            setter(parsedHero);
          } else {
            throw new Error(`${versionLabel} heroConfig from localStorage is missing required fields (headline or ctaText). Parsed: ${JSON.stringify(parsedHero)}`);
          }
        } catch (e: any) {
          console.error(`LandingPreviewPage: Error parsing ${versionLabel} from localStorage. String was:`, heroString, "Error:", e);
          setError(prev => {
            const newError = `Error parsing ${versionLabel} hero config. Details in console. Displaying fallback.`;
            return prev ? `${prev} ${newError}` : newError;
          });
          setter(fallbackConfig); 
        }
      } else {
        console.log(`LandingPreviewPage: ${versionLabel} hero config string not found or empty in localStorage. Using fallback. String was: `, heroString);
        setter(fallbackConfig); 
      }
    };

    parseAndSetHeroConfig(localHeroConfigAString, setHeroConfigA, 'Version A', createDefaultHeroConfig('Version A - Fallback'));
    parseAndSetHeroConfig(localHeroConfigBString, setHeroConfigB, 'Version B', createDefaultHeroConfig('Version B - Fallback'));

    if (!localHeroConfigAString && !localHeroConfigBString && !error) { // ensure we don't overwrite a parse error
      console.log("LandingPreviewPage: No hero configurations found in local storage. Displaying default fallback versions for A and B.");
      setError("No hero configurations found in local storage. Displaying default fallback versions for A and B.");
    } else if (!error && (localHeroConfigAString || localHeroConfigBString)) {
      setError(null); 
    }
    setIsLoading(false);

  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-foreground mt-4">Loading hero preview configurations...</p>
      </div>
    );
  }

  const renderPageSections = (heroConfig: RecommendationHeroConfig, versionLabel: string) => (
    <div className="flex-1 border border-border rounded-lg p-0 shadow-lg overflow-hidden">
      <h3 className="text-xl font-semibold text-center my-4 text-primary">{versionLabel} - Hero Preview</h3>
      <HeroSection {...heroConfig} />
      {/* Other sections (Benefits, Testimonials, etc.) are removed for this simplified preview */}
      <div className="p-4 text-center text-sm text-muted-foreground">
        (Previewing Hero Section only. Other sections like Benefits, Testimonials, Trust Signals, and Form are not shown in this simplified A/B hero preview.)
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-center mb-2 text-foreground">Landing Page A/B Hero Preview</h2>
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-md flex items-center justify-center max-w-3xl mx-auto">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {renderPageSections(heroConfigA, "Version A")}
          {renderPageSections(heroConfigB, "Version B")}
        </div>
      </main>
      <Footer />
    </div>
  );
}
    

    