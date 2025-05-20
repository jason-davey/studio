
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { UIActionProvider } from '@/contexts/UIActionContext';
import { AuthProvider } from '@/contexts/AuthContext'; // Re-added
import TopBar from '@/components/layout/TopBar';

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
      <head>
        {/*
          AB Tasty Script Placeholder:
          Paste your AB Tasty JavaScript snippet here.
          It should typically be placed as early as possible in the <head>.
          Consult your AB Tasty documentation for the exact placement and script.
        */}
      </head>
      <body className="font-sans antialiased">
        <AuthProvider> {/* Re-added AuthProvider wrapping UIActionProvider */}
          <UIActionProvider>
            <TopBar />
            {children}
            <Toaster />
          </UIActionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
