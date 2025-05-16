
'use client'; 

import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import AwardsSection from '@/components/landing/AwardsSection';
import QuoteFormSection from '@/components/landing/QuoteFormSection';
import Footer from '@/components/landing/Footer';
import type { ComponentProps } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';


type HeroConfig = ComponentProps<typeof HeroSection>;

// Define the baseline (control) configuration as a fallback
const fallbackHeroConfigA: HeroConfig = {
  headline: "Default: Ensure Your Family's Financial Security",
  subHeadline: "(default: even when you can't be there for them)",
  ctaText: "Default: Secure My Family's Future",
};

// Define a sample variant configuration (Variant A) as a fallback
const fallbackHeroConfigB: HeroConfig = {
  headline: "Default: Unlock Financial Peace of Mind",
  subHeadline: "(default: protecting your loved ones, always)",
  ctaText: "Default: Get Protected Today",
};

export default function LandingPreviewPage() {
  const searchParams = useSearchParams();
  const [heroConfigA, setHeroConfigA] = useState<HeroConfig>(fallbackHeroConfigA);
  const [heroConfigB, setHeroConfigB] = useState<HeroConfig>(fallbackHeroConfigB);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Component has mounted, safe to use searchParams
  }, []);

  useEffect(() => {
    if (!isClient) return; // Don't run on server or before hydration

    const configAString = searchParams.get('configA');
    const configBString = searchParams.get('configB');
    let parseError = false;

    if (configAString) {
      try {
        const parsedConfigA = JSON.parse(configAString) as HeroConfig;
        // Basic validation
        if (parsedConfigA.headline !== undefined && parsedConfigA.subHeadline !== undefined && parsedConfigA.ctaText !== undefined) {
            setHeroConfigA(parsedConfigA);
        } else {
            throw new Error("Version A config is missing required fields.");
        }
      } catch (e) {
        console.error("Error parsing configA from URL:", e);
        setError(prev => prev ? `${prev} Error parsing Version A.` : "Error parsing Version A.");
        setHeroConfigA(fallbackHeroConfigA); // Fallback on error
        parseError = true;
      }
    } else {
        // If no configA in URL, use fallback (already set by useState)
        // Potentially set a specific message if desired
    }

    if (configBString) {
      try {
        const parsedConfigB = JSON.parse(configBString) as HeroConfig;
         if (parsedConfigB.headline !== undefined && parsedConfigB.subHeadline !== undefined && parsedConfigB.ctaText !== undefined) {
            setHeroConfigB(parsedConfigB);
        } else {
            throw new Error("Version B config is missing required fields.");
        }
      } catch (e) {
        console.error("Error parsing configB from URL:", e);
        setError(prev => prev ? `${prev} Error parsing Version B.` : "Error parsing Version B.");
        setHeroConfigB(fallbackHeroConfigB); // Fallback on error
        parseError = true;
      }
    } else {
        // If no configB in URL, use fallback
    }

    if (!configAString && !configBString && !parseError) {
        setError("No configurations provided in URL. Displaying default fallback versions.");
    } else if (!parseError) {
        setError(null); // Clear error if parsing was successful or no params initially
    }

  }, [searchParams, isClient]);

  if (!isClient) {
    // Render a loading state or null during SSR/pre-hydration
    return (
      <div className="flex flex-col min-h-screen bg-background justify-center items-center">
        <p className="text-lg text-foreground">Loading preview...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <div className="p-4 md:p-8">
          <h2 className="text-2xl font-bold text-center mb-2 text-foreground">Landing Page Preview</h2>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-md flex items-center justify-center max-w-2xl mx-auto">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 border border-border rounded-lg p-4 shadow-lg">
              <h3 className="text-xl font-semibold text-center mb-4 text-primary">Version A</h3>
              <HeroSection 
                headline={heroConfigA.headline}
                subHeadline={heroConfigA.subHeadline}
                ctaText={heroConfigA.ctaText}
              />
            </div>

            <div className="flex-1 border border-border rounded-lg p-4 shadow-lg">
              <h3 className="text-xl font-semibold text-center mb-4 text-primary">Version B</h3>
              <HeroSection 
                headline={heroConfigB.headline}
                subHeadline={heroConfigB.subHeadline}
                ctaText={heroConfigB.ctaText}
              />
            </div>
          </div>
        </div>

        <BenefitsSection />
        <TestimonialsSection />
        <AwardsSection />
        <QuoteFormSection />
      </main>
      <Footer />
    </div>
  );
}

    