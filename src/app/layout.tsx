import type { Metadata } from 'next';
// Removed Geist font imports as we are using URW DIN defined via @font-face and tailwind.config
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

// Removed Geist font variables

export const metadata: Metadata = {
  title: 'SecureTomorrow Landing Page | Real Insurance',
  description: 'Secure your family\'s financial future with Real Insurance. Get a personalized life insurance plan in 60 seconds.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply font-sans (which is now URW DIN) directly to the body */}
      {/* Removed explicit font-din class and Geist variables */}
      <body className="font-sans antialiased"> {/* Added font-sans */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
