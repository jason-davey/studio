
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Award, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  headline?: string;
  subHeadline?: string;
  ctaText?: string;
  uniqueValueProposition?: string; // Added this prop
  heroImageUrl?: string; // Added this prop
}

const defaultProps: Required<HeroSectionProps> = {
  headline: "Ensure Your Family's Financial Security",
  subHeadline: "(even when you can't be there for them)",
  ctaText: "Secure My Family's Future Now",
  uniqueValueProposition: "Only Real Insurance gives you The Real Reward™: 10% cash back after your first year, plus a free legal will valued at $160.",
  heroImageUrl: "https://placehold.co/1600x900.png",
};

export default function HeroSection(props: HeroSectionProps) {
  const { 
    headline, 
    subHeadline, 
    ctaText, 
    uniqueValueProposition, 
    heroImageUrl 
  } = { ...defaultProps, ...props };

  return (
    <section className="relative bg-slate-800 text-white py-20 md:py-32">
      <Image
        src={heroImageUrl || defaultProps.heroImageUrl}
        alt={props.headline || "Family enjoying time together"} // Use headline for alt if available
        layout="fill"
        objectFit="cover"
        quality={75}
        className="opacity-30"
        data-ai-hint="family protection"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-slate-800/30"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <ShieldAlert className="h-16 w-16 text-accent mx-auto mb-6" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          {headline}
          {subHeadline && (
            <br />
          )}
          {subHeadline && (
            <span className="block text-2xl sm:text-3xl md:text-4xl font-bold mt-2 lowercase">
              {subHeadline}
            </span>
          )}
        </h1>
        {uniqueValueProposition && (
          <div className="max-w-3xl mx-auto bg-primary/80 backdrop-blur-sm p-6 rounded-lg shadow-xl mb-10">
            <div className="flex items-center justify-center mb-3 space-x-2">
              <Award className="h-8 w-8 text-accent" />
              <h2 className="text-2xl font-semibold text-accent">The Real Reward™</h2>
            </div>
            <p className="text-lg sm:text-xl text-primary-foreground">
              {uniqueValueProposition}
            </p>
          </div>
        )}
        <Button
          size="lg"
          className="bg-cta text-cta-foreground hover:bg-cta/90 text-lg px-10 py-6"
          asChild
        >
          <Link href="#quote-form">{ctaText}</Link>
        </Button>
      </div>
    </section>
  );
}

    