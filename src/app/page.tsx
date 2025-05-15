
'use client'; // Required for hooks like useState and useEffect

import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import AwardsSection from '@/components/landing/AwardsSection';
import QuoteFormSection from '@/components/landing/QuoteFormSection';
import Footer from '@/components/landing/Footer';
import { useRemoteConfigValue } from '@/hooks/useRemoteConfigValue';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';


type HeroConfig = ComponentProps<typeof HeroSection>;

const defaultHeroConfig: HeroConfig = {
  headline: "Ensure Your Family's Financial Security",
  subHeadline: "(even when you can't be there for them)",
  ctaText: "Secure My Family's Future Now",
};

export default function SecureTomorrowLandingPage() {
  // Fallback to default if remote config is not available or loading
  const heroConfig = useRemoteConfigValue<HeroConfig>('heroConfig', defaultHeroConfig);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by only rendering dynamic hero section on client
  const heroSectionContent = isClient ? (
    <HeroSection 
      headline={heroConfig?.headline}
      subHeadline={heroConfig?.subHeadline}
      ctaText={heroConfig?.ctaText}
    />
  ) : (
    <HeroSection 
      headline={defaultHeroConfig.headline}
      subHeadline={defaultHeroConfig.subHeadline}
      ctaText={defaultHeroConfig.ctaText}
    />
  );


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {heroSectionContent}
        <BenefitsSection />
        <TestimonialsSection />
        <AwardsSection />
        <QuoteFormSection />
      </main>
      <Footer />
    </div>
  );
}
