
'use client';

import { Button } from '@/components/ui/button';
import { useUIActions } from '@/contexts/UIActionContext';
// Removed: import { useAuth } from '@/contexts/AuthContext';
// Removed: import { authInstance } from '@/lib/firebase';
// Removed: import { signOut } from 'firebase/auth';
// Removed: import { useRouter } from 'next/navigation';
import { MessageSquare, HelpCircle } from 'lucide-react'; // Removed LogOut, UserCircle
// Removed: import { useToast } from '@/hooks/use-toast';

export const TOP_BAR_HEIGHT_PX = 60; 

export default function TopBar() {
  const { setIsFeedbackModalOpen, setShowWelcomeModal } = useUIActions();
  // Removed: const { currentUser } = useAuth();
  // Removed: const router = useRouter();
  // Removed: const { toast } = useToast();

  // Removed: handleLogout function

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[--top-bar-height] bg-background border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 shadow-sm"
      style={{ zIndex: 100, '--top-bar-height': `${TOP_BAR_HEIGHT_PX}px` } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        {/* Removed currentUser display */}
      </div>
      <div className="flex items-center gap-2">
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
        {/* Removed Logout button */}
      </div>
    </div>
  );
}
