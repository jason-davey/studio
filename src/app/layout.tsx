
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { UIActionProvider } from '@/contexts/UIActionContext';
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider
import TopBar from '@/components/layout/TopBar';
// We will also need to render FeedbackModal and WelcomeModal here, driven by UIActionContext

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
        <AuthProvider> {/* Wrap with AuthProvider */}
          <UIActionProvider>
            <TopBar />
            {/* 
              FeedbackModal and WelcomeModal will need to be rendered here too, 
              likely within a client component that consumes UIActionContext 
              or directly if they can be simple presentational components triggered by context.
              For now, this structure sets up TopBar. We'll adjust modal rendering in page.tsx
              or lift it fully if needed in subsequent steps.
            */}
            {children}
            <Toaster />
          </UIActionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
