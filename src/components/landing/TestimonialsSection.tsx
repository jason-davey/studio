import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah T.",
    location: "Melbourne",
    avatar: "ST",
    image: "https://picsum.photos/100/100?random=1",
    dataAiHint: "woman smiling",
    quote: "Real Insurance gave me peace of mind knowing my children's education would be covered if anything happened to me. The process was simple, and the monthly premium fits my budget perfectly.",
    since: "Protected since 2022",
  },
  {
    name: "Mark R.",
    location: "Sydney",
    avatar: "MR",
    image: "https://picsum.photos/100/100?random=2",
    dataAiHint: "man confident",
    quote: "After comparing several options, Real Insurance stood out with The Real Reward™. Getting 10% cash back was a fantastic bonus! Highly recommend.",
    since: "Protected since 2023",
  },
  {
    name: "Lisa P.",
    location: "Brisbane",
    avatar: "LP",
    image: "https://picsum.photos/100/100?random=3",
    dataAiHint: "person happy",
    quote: "The phone application was incredibly easy, just as promised. I felt valued and understood, not just like another number. The free legal will was an unexpected perk!",
    since: "Protected since 2021",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Trusted by Families Across Australia
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from real customers who secured their family&apos;s future with Real Insurance.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} data-ai-hint={testimonial.dataAiHint} />
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <Quote className="h-8 w-8 text-accent mb-4 transform scale-x-[-1]" />
                <p className="text-muted-foreground italic mb-4 flex-grow">&quot;{testimonial.quote}&quot;</p>
                <p className="text-sm font-semibold text-primary">{testimonial.since}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
