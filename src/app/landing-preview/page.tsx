
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
import type { PageBlueprint } from '@/types/recommendations';

const createDefaultBlueprint = (versionLabel: string): PageBlueprint => ({
  pageName: `Default Preview - ${versionLabel}`,
  heroConfig: {
    headline: `Default: Ensure Your Family's Financial Security (${versionLabel})`,
    subHeadline: `(default: even when you can't be there for them)`,
    ctaText: `Default: Secure My Family's Future`,
    uniqueValueProposition: "Only Real Insurance gives you The Real Reward™: 10% cash back after your first year, plus a free legal will valued at $160.",
    heroImageUrl: "https://placehold.co/1600x900.png",
    heroImageAltText: "Family enjoying time together"
  },
  benefits: undefined,
  testimonials: undefined,
  trustSignals: undefined,
  formConfig: {
    headline: `Default: Get Your Personalized Plan (${versionLabel})`,
    ctaText: `Default: See My Quote Today`
  },
  sectionVisibility: {
    hero: true,
    benefits: true,
    testimonials: true,
    trustSignals: true,
    form: true,
  },
});

export default function LandingPreviewPage() {
  const [blueprintA, setBlueprintA] = useState<PageBlueprint>(() => createDefaultBlueprint('Version A - Fallback'));
  const [blueprintB, setBlueprintB] = useState<PageBlueprint>(() => createDefaultBlueprint('Version B - Fallback'));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('LandingPreviewPage: useEffect for localStorage read is running.');

    if (typeof window.localStorage === 'undefined') {
      console.error('LandingPreviewPage: window.localStorage is not available!');
      setError('Local storage is not available in this browser environment. Cannot load preview configurations.');
      setIsLoading(false);
      return;
    }
    console.log('LandingPreviewPage: window.localStorage is available.');

    let localBlueprintAString: string | null = null;
    let localBlueprintBString: string | null = null;
    let parseError = false;

    try {
      localBlueprintAString = localStorage.getItem('previewBlueprintA_temp');
      console.log('LandingPreviewPage: Read blueprintA_temp from localStorage:', localBlueprintAString ? localBlueprintAString.substring(0,100) + "..." : localBlueprintAString);

      localBlueprintBString = localStorage.getItem('previewBlueprintB_temp');
      console.log('LandingPreviewPage: Read blueprintB_temp from localStorage:', localBlueprintBString ? localBlueprintBString.substring(0,100) + "..." : localBlueprintBString);

      // DIAGNOSTIC: Keep removeItem commented out for now to see if data ever makes it
      // if (localBlueprintAString) localStorage.removeItem('previewBlueprintA_temp');
      // if (localBlueprintBString) localStorage.removeItem('previewBlueprintB_temp');
      // console.log('LandingPreviewPage: DIAGNOSTIC - Temporary blueprints NOT removed from localStorage.');

    } catch (e) {
      console.error("LandingPreviewPage: Error accessing localStorage:", e);
      setError("Could not access local storage. Displaying fallback versions.");
      parseError = true;
    }

    const parseAndSetBlueprint = (
      bpString: string | null,
      setter: React.Dispatch<React.SetStateAction<PageBlueprint>>,
      versionLabel: string,
      fallbackBlueprint: PageBlueprint
    ) => {
      if (bpString && bpString.length > 10) { 
        try {
          const parsedBP = JSON.parse(bpString) as PageBlueprint;
          if (parsedBP.pageName && parsedBP.heroConfig && parsedBP.formConfig) {
            setter({
              ...fallbackBlueprint, 
              ...parsedBP, 
              sectionVisibility: { 
                ...(fallbackBlueprint.sectionVisibility || {}),
                ...(parsedBP.sectionVisibility || {}),
              },
            });
          } else {
            throw new Error(`${versionLabel} blueprint from localStorage is missing required fields (pageName, heroConfig, or formConfig). Parsed: ${JSON.stringify(parsedBP)}`);
          }
        } catch (e: any) {
          console.error(`LandingPreviewPage: Error parsing ${versionLabel} from localStorage. String was:`, bpString, "Error:", e);
          setError(prev => {
            const newError = `Error parsing ${versionLabel} blueprint. Details in console. Displaying fallback.`;
            return prev ? `${prev} ${newError}` : newError;
          });
          setter(fallbackBlueprint); 
          parseError = true;
        }
      } else {
        console.log(`LandingPreviewPage: ${versionLabel} blueprint string not found or empty in localStorage. Using fallback. String was: `, bpString);
        setter(fallbackBlueprint); 
      }
    };

    parseAndSetBlueprint(localBlueprintAString, setBlueprintA, 'Version A', createDefaultBlueprint('Version A - Fallback'));
    parseAndSetBlueprint(localBlueprintBString, setBlueprintB, 'Version B', createDefaultBlueprint('Version B - Fallback'));

    if (!localBlueprintAString && !localBlueprintBString && !parseError) {
      console.log("LandingPreviewPage: No blueprint configurations found in local storage. Displaying default fallback versions for A and B.");
      setError("No blueprint configurations found in local storage. Displaying default fallback versions for A and B.");
    } else if (!parseError && (localBlueprintAString || localBlueprintBString)) {
      setError(null); 
    }
    setIsLoading(false);

  }, []); // Runs once after component mounts on client

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-foreground mt-4">Loading preview configurations...</p>
      </div>
    );
  }

  const renderPageSections = (blueprint: PageBlueprint, versionLabel: string) => (
    <div className="flex-1 border border-border rounded-lg p-0 shadow-lg overflow-hidden">
      <h3 className="text-xl font-semibold text-center my-4 text-primary">{versionLabel} - {blueprint.pageName}</h3>
      {blueprint.sectionVisibility?.hero && blueprint.heroConfig && (
        <HeroSection {...blueprint.heroConfig} />
      )}
      {blueprint.sectionVisibility?.benefits && (
        <BenefitsSection benefits={blueprint.benefits} />
      )}
      {blueprint.sectionVisibility?.testimonials && (
        <TestimonialsSection testimonials={blueprint.testimonials} />
      )}
      {blueprint.sectionVisibility?.trustSignals && (
        <TrustSignalsSection trustSignals={blueprint.trustSignals} />
      )}
      {blueprint.sectionVisibility?.form && blueprint.formConfig && (
         <QuoteFormSection {...blueprint.formConfig} />
      )}
       {!(blueprint.sectionVisibility?.hero ||
           blueprint.sectionVisibility?.benefits ||
           blueprint.sectionVisibility?.testimonials ||
           blueprint.sectionVisibility?.trustSignals ||
           blueprint.sectionVisibility?.form) && (
          <p className="p-6 text-center text-muted-foreground">All sections are hidden for {versionLabel}.</p>
        )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-center mb-2 text-foreground">Landing Page A/B Preview</h2>
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-md flex items-center justify-center max-w-3xl mx-auto">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {renderPageSections(blueprintA, "Version A")}
          {renderPageSections(blueprintB, "Version B")}
        </div>
      </main>
      <Footer />
    </div>
  );
}
    