
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecommendationBenefit } from '@/types/recommendations';
import * as LucideIcons from 'lucide-react';

interface BenefitsSectionProps {
  benefits?: RecommendationBenefit[];
}

// A helper to dynamically render Lucide icons
const DynamicLucideIcon = ({ name, ...props }: { name: string } & LucideIcons.LucideProps) => {
  const IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    // Fallback if icon name is invalid or not found
    return <LucideIcons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
};


const defaultBenefits: RecommendationBenefit[] = [
  {
    icon: "Clock",
    title: "Speedy Application (Default)",
    description: "Apply in minutes over the phone—no complicated paperwork or medical exams to delay your peace of mind.",
  },
  {
    icon: "FileText",
    title: "Flexible Cover (Default)",
    description: "Secure a significant lump sum up to $1 million, tailored to your family's needs.",
  },
  {
    icon: "CheckCircle2",
    title: "Guaranteed Renewable (Default)",
    description: "Peace of mind with cover guaranteed renewable up to age 99, adapting to your life changes.",
  },
  {
    icon: "ShieldQuestion",
    title: "Terminal Illness Benefit (Default)",
    description: "Receive an advance payment if diagnosed with a terminal illness, providing financial support when you need it most.",
  },
];


export default function BenefitsSection({ benefits = defaultBenefits }: BenefitsSectionProps) {
  const benefitsToDisplay = benefits && benefits.length > 0 ? benefits : defaultBenefits;

  return (
    <section className="py-16 lg:py-24 bg-[#F0EDE2]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Protection Made Simple & Rewarding
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how Real Life Insurance offers straightforward, valuable cover designed with your needs in mind.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(benefitsToDisplay).map((benefit, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
              <CardHeader className="items-center text-center">
                {benefit.icon ? (
                    <DynamicLucideIcon name={benefit.icon} className="h-8 w-8 text-primary mb-3" />
                ) : (
                    <LucideIcons.HelpCircle className="h-8 w-8 text-primary mb-3" /> // Default icon if none provided
                )}
                <CardTitle className="text-xl text-primary">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
