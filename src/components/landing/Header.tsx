import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-between items-center"> {/* Increased py from py-3 to py-10 */}
        <Link href="/" className="flex items-center">
          {/* Logo - Placed in public/resources */}
          <Image
            src="/resources/logo.png" // Path is relative to the 'public' directory
            alt="Real Insurance Logo"
            width={187.5} // Increased from 150
            height={50}   // Increased from 40
            priority // Load the logo quickly
          />
        </Link>
        <div className="flex items-center space-x-4">
           {/* Updated button style to use new CTA color and made always visible */}
           <Button className="inline-flex bg-cta text-cta-foreground hover:bg-cta/90" size="sm" asChild>
              <Link href="#quote-form">Get a Quote</Link>
           </Button>
           {/* Mobile Menu Button (hamburger icon) removed */}
        </div>
      </div>
    </header>
  );
}
