
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, ShieldCheck } from 'lucide-react'; 
import Link from 'next/link';

const awardsData = [
  {
    icon: <Trophy className="h-10 w-10 text-primary mb-3" />,
    title: "Customer Satisfaction Award 2023 - Roy Morgan",
    details: "Risk & Life Insurer of the Year - 2023",
    description: "Real Insurance was awarded the 2023 Risk & Life Insurer of the Year winner at the Roy Morgan Customer Satisfaction Awards.",
    url: "https://www.roymorgan.com/findings/customer-satisfaction-awards-banking-and-finance-winners-2023", 
  },
  {
    icon: <Star className="h-10 w-10 text-primary mb-3" />,
    title: "Canstar Outstanding Value Award",
    details: "Life Insurance - 2023",
    description: "Awarded for offering outstanding value to Australian consumers seeking life insurance.",
    url: "http://www.canstar.com.au/wp-content/uploads/2013/02/direct-life-insurance-aug-2012.pdf", 
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary mb-3" />,
    title: "Feefo Platinum Trusted Service Award",
    details: "Funeral Insurance - 2024", 
    description: "Awarded for consistently delivering excellence in customer service and experience.",
    url: "https://business.feefo.com/company/trusted-service-awards/", 
  },
];

export default function AwardsSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Award-Winning Protection You Can Trust
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real Insurance is consistently recognised for providing outstanding value and service.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {awardsData.map((award, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card flex flex-col">
              <CardHeader className="items-center text-center">
                {award.icon}
                <CardTitle className="text-xl text-primary">
                  <Link href={award.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {award.title}
                  </Link>
                </CardTitle>
                 <p className="text-sm font-semibold text-foreground mt-1">{award.details}</p>
              </CardHeader>
              <CardContent className="text-center flex-grow">
                <p className="text-muted-foreground">{award.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

