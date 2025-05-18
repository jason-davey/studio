
'use client';

import { Button } from '@/components/ui/button';
import { useUIActions } from '@/contexts/UIActionContext';
import { MessageSquare, HelpCircle } from 'lucide-react';

// Estimate height for padding calculations on the main page content
export const TOP_BAR_HEIGHT_PX = 60; // Adjust this if padding/button sizes change significantly

export default function TopBar() {
  const { setIsFeedbackModalOpen, setShowWelcomeModal } = useUIActions();

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[--top-bar-height] bg-background border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-2 shadow-sm"
      style={{ zIndex: 100, '--top-bar-height': `${TOP_BAR_HEIGHT_PX}px` } as React.CSSProperties}
    >
      <Button
        variant="outline"
        onClick={() => setIsFeedbackModalOpen(true)}
        className="h-auto py-1.5 px-3 text-xs sm:text-sm"
        id="global-provide-feedback-button"
      >
        <MessageSquare className="mr-1.5 h-4 w-4" />
        Provide Feedback
      </Button>
      <Button
        variant="outline"
        onClick={() => setShowWelcomeModal(true)}
        className="h-auto py-1.5 px-3 text-xs sm:text-sm"
        id="global-start-walkthrough-button"
      >
        <HelpCircle className="mr-1.5 h-4 w-4" />
        Guided Walkthrough
      </Button>
    </div>
  );
}
