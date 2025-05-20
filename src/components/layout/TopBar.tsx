
'use client';

import { Button } from '@/components/ui/button';
import { useUIActions } from '@/contexts/UIActionContext';
import { useAuth } from '@/contexts/AuthContext';
import { authInstance } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { MessageSquare, HelpCircle, LayoutDashboard, FileText, LogOut, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const TOP_BAR_HEIGHT_PX = 60;

export default function TopBar() {
  const { setIsFeedbackModalOpen, setShowWelcomeModal } = useUIActions();
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (authInstance) {
      try {
        await signOut(authInstance);
        router.push('/login');
      } catch (error) {
        console.error("Error signing out: ", error);
      }
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[--top-bar-height] bg-background border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 shadow-sm"
      style={{ zIndex: 100, '--top-bar-height': `${TOP_BAR_HEIGHT_PX}px` } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="h-auto py-1.5 px-2 text-xs sm:text-sm">
          <Link href="/">
            <LayoutDashboard className="mr-1.5 h-4 w-4" />
            Workflow
          </Link>
        </Button>
        {!authLoading && currentUser && userRole === 'admin' && (
          <Button variant="ghost" size="sm" asChild className="h-auto py-1.5 px-2 text-xs sm:text-sm">
            <Link href="/admin/tech-spec">
              <FileText className="mr-1.5 h-4 w-4" />
              Tech Spec
            </Link>
          </Button>
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
        {!authLoading && currentUser && (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="h-auto py-1.5 px-3 text-xs sm:text-sm"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            Logout ({currentUser.email?.split('@')[0]})
          </Button>
        )}
        {!authLoading && !currentUser && (
          <>
            <Button variant="outline" size="sm" asChild className="h-auto py-1.5 px-2 text-xs sm:text-sm">
              <Link href="/login">
                <LogIn className="mr-1.5 h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button variant="default" size="sm" asChild className="h-auto py-1.5 px-2 text-xs sm:text-sm">
              <Link href="/register">
                <UserPlus className="mr-1.5 h-4 w-4" />
                Register
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
