
'use client';

import { Button } from '@/components/ui/button';
import { useUIActions } from '@/contexts/UIActionContext';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { authInstance } from '@/lib/firebase'; // Import authInstance for signOut
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { MessageSquare, HelpCircle, LogOut, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TOP_BAR_HEIGHT_PX = 60; 

export default function TopBar() {
  const { setIsFeedbackModalOpen, setShowWelcomeModal } = useUIActions();
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!authInstance) {
      toast({ title: "Logout Error", description: "Authentication service unavailable.", variant: "destructive" });
      return;
    }
    try {
      await signOut(authInstance);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Error", description: "Failed to log out. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[--top-bar-height] bg-background border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 shadow-sm"
      style={{ zIndex: 100, '--top-bar-height': `${TOP_BAR_HEIGHT_PX}px` } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        {currentUser && (
          <div className="flex items-center text-sm text-muted-foreground">
            <UserCircle className="mr-1.5 h-4 w-4" />
            <span>{currentUser.email}</span>
          </div>
        )}
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
        {currentUser && (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="h-auto py-1.5 px-3 text-xs sm:text-sm"
            id="global-logout-button"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
