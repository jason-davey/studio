
'use client'; // Required for hooks like useState and useEffect

import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import AwardsSection from '@/components/landing/AwardsSection';
import QuoteFormSection from '@/components/landing/QuoteFormSection';
import Footer from '@/components/landing/Footer';
// import { useRemoteConfigValue } from '@/hooks/useRemoteConfigValue'; // No longer needed for this review page
import type { ComponentProps } from 'react';
// import { useEffect, useState } from 'react'; // No longer needed for hero section rendering logic


type HeroConfig = ComponentProps<typeof HeroSection>;

// Define the baseline (control) configuration
const baselineHeroConfig: HeroConfig = {
  headline: "Ensure Your Family's Financial Security",
  subHeadline: "(even when you can't be there for them)",
  ctaText: "Secure My Family's Future Now",
};

// Define a sample variant configuration (Variant A)
const variantAHeroConfig: HeroConfig = {
  headline: "Unlock Financial Peace of Mind",
  subHeadline: "(protecting your loved ones, always)",
  ctaText: "Get Protected Today",
};

export default function LandingPreviewPage() { // Renamed from SecureTomorrowLandingPage
  // The useRemoteConfigValue hook and isClient state are removed for this side-by-side review.
  // We will directly render two HeroSection components with predefined configs.

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Container for side-by-side Hero Sections */}
        <div className="p-4 md:p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-foreground">A/B Test Preview</h2>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Baseline Hero Section */}
            <div className="flex-1 border border-border rounded-lg p-4 shadow-lg">
              <h3 className="text-xl font-semibold text-center mb-4 text-primary">Baseline Version</h3>
              <HeroSection 
                headline={baselineHeroConfig.headline}
                subHeadline={baselineHeroConfig.subHeadline}
                ctaText={baselineHeroConfig.ctaText}
              />
            </div>

            {/* Variant A Hero Section */}
            <div className="flex-1 border border-border rounded-lg p-4 shadow-lg">
              <h3 className="text-xl font-semibold text-center mb-4 text-primary">Variant A</h3>
              <HeroSection 
                headline={variantAHeroConfig.headline}
                subHeadline={variantAHeroConfig.subHeadline}
                ctaText={variantAHeroConfig.ctaText}
              />
            </div>
          </div>
        </div>

        {/* Other sections of the page */}
        <BenefitsSection />
        <TestimonialsSection />
        <AwardsSection />
        <QuoteFormSection />
      </main>
      <Footer />
    </div>
  );
}

