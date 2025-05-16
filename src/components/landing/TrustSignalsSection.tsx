
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecommendationTrustSignal } from '@/types/recommendations';
import { Award, Star, ShieldCheck, BarChart3, ThumbsUp, Info } from 'lucide-react';
import Image from 'next/image';

interface TrustSignalsSectionProps {
  trustSignals?: RecommendationTrustSignal[];
}

const defaultTrustSignals: RecommendationTrustSignal[] = [
  {
    type: 'award',
    text: 'Winner of Roy Morgan Customer Satisfaction Award (Default)',
    details: 'Risk & Life Insurer of the Year - 2022 & 2023',
    imageUrl: 'https://placehold.co/150x60.png',
  },
  {
    type: 'rating',
    text: 'Rated 4.7/5 Stars (Default)',
    source: 'Feefo Reviews',
    details: 'Based on 5,000+ verified reviews',
  },
  {
    type: 'statistic',
    text: 'Over 500,000 Australians Protected (Default)',
    source: 'Real Insurance Data, 2024',
  },
];

const iconMap: { [key in RecommendationTrustSignal['type']]: React.ElementType } = {
  award: Award,
  rating: Star,
  statistic: BarChart3,
  badge: ShieldCheck,
  text: Info,
};

export default function TrustSignalsSection({ trustSignals = defaultTrustSignals }: TrustSignalsSectionProps) {
  const signalsToDisplay = trustSignals && trustSignals.length > 0 ? trustSignals : defaultTrustSignals;

  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Peace of Mind, Backed by Trust
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re committed to providing reliable protection and transparent service.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(signalsToDisplay).map((signal, index) => {
            const IconComponent = iconMap[signal.type] || ThumbsUp;
            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card flex flex-col">
                <CardHeader className="items-center text-center">
                  {signal.imageUrl ? (
                    <Image 
                        src={signal.imageUrl} 
                        alt={signal.text} 
                        width={120} 
                        height={50} 
                        className="mb-3 object-contain"
                        data-ai-hint="logo award" 
                    />
                  ) : (
                    <IconComponent className="h-10 w-10 text-primary mb-3" />
                  )}
                  <CardTitle className="text-lg text-primary">{signal.text}</CardTitle>
                  {signal.details && <p className="text-sm font-semibold text-foreground mt-1">{signal.details}</p>}
                </CardHeader>
                <CardContent className="text-center flex-grow">
                  {signal.source && <p className="text-xs text-muted-foreground">Source: {signal.source}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
