
'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUIActions } from '@/contexts/UIActionContext';
import { useAuth } from '@/contexts/AuthContext';
import { authInstance } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { MessageSquare, HelpCircle, LayoutDashboard, FileText, LogOut, LogIn, UserPlus, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const TOP_BAR_HEIGHT_PX = 60; // Adjusted for potential extra height if switch is larger

export default function TopBar() {
  const { setIsFeedbackModalOpen, setShowWelcomeModal } = useUIActions();
  const { currentUser, userRole, loading: authLoading, isActualAdmin, viewingAsRole, setViewOverride } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (authInstance) {
      try {
        await signOut(authInstance);
        setViewOverride(null); // Clear view override on logout
        router.push('/login');
      } catch (error) {
        console.error("Error signing out: ", error);
      }
    }
  };

  const handleViewAsToggle = () => {
    if (isActualAdmin) {
      setViewOverride(viewingAsRole === 'creator' ? null : 'creator');
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[--top-bar-height] bg-background border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-x-2 shadow-sm"
      style={{ zIndex: 100, '--top-bar-height': `${TOP_BAR_HEIGHT_PX}px` } as React.CSSProperties}
    >
      <div className="flex items-center gap-x-1 sm:gap-x-2">
        <Button variant="ghost" size="sm" asChild className="h-auto py-1.5 px-2 text-xs sm:text-sm">
          <Link href="/">
            <LayoutDashboard className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Workflow</span>
          </Link>
        </Button>
        {!authLoading && currentUser && userRole === 'admin' && (
          <Button variant="ghost" size="sm" asChild className="h-auto py-1.5 px-2 text-xs sm:text-sm">
            <Link href="/admin/tech-spec">
              <FileText className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Tech Spec</span>
            </Link>
          </Button>
        )}
      </div>
      <div className="flex items-center gap-x-1 sm:gap-x-2">
        {isActualAdmin && !authLoading && currentUser && (
          <div className="flex items-center space-x-2 border-r border-border pr-2 sm:pr-3 mr-1 sm:mr-2">
            <Label htmlFor="view-as-switch" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              View as:
            </Label>
            <Button
              onClick={handleViewAsToggle}
              variant="outline"
              size="sm"
              className="h-auto py-1 px-2 text-xs sm:text-sm"
              title={viewingAsRole === 'creator' ? "Switch to Admin View" : "Switch to Creator View"}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              {viewingAsRole === 'creator' ? 'Creator' : 'Admin'}
            </Button>
          </div>
        )}
        <Button
          variant="outline"
          onClick={() => setIsFeedbackModalOpen(true)}
          className="h-auto py-1.5 px-2 sm:px-3 text-xs sm:text-sm"
          id="global-provide-feedback-button"
        >
          <MessageSquare className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Provide Feedback</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowWelcomeModal(true)}
          className="h-auto py-1.5 px-2 sm:px-3 text-xs sm:text-sm"
          id="global-start-walkthrough-button"
        >
          <HelpCircle className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Guided Walkthrough</span>
        </Button>
        {!authLoading && currentUser && (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="h-auto py-1.5 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <LogOut className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden"> ({currentUser.email?.split('@')[0].substring(0,6)}...)</span>
          </Button>
        )}
        {!authLoading && !currentUser && (
          <>
            <Button variant="outline" size="sm" asChild className="h-auto py-1.5 px-2 text-xs sm:text-sm">
              <Link href="/login">
                <LogIn className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Login
              </Link>
            </Button>
            <Button variant="default" size="sm" asChild className="h-auto py-1.5 px-2 text-xs sm:text-sm">
              <Link href="/register">
                <UserPlus className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Register
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
