
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWalkthrough } from '@/contexts/WalkthroughContext';
import { useUIActions } from '@/contexts/UIActionContext'; // To control global modal state

export default function WelcomeModal() {
  const walkthrough = useWalkthrough();
  const uiActions = useUIActions(); // Get global modal controllers

  const handleStartTour = () => {
    uiActions.setShowWelcomeModal(false); // Close via global context
    walkthrough.actuallyStartWalkthrough(); 
  };

  const handleCloseOrSkip = () => {
    uiActions.setShowWelcomeModal(false); // Close via global context
    walkthrough.endWalkthrough(); 
  }

  // Dialog open state is now controlled by UIActionContext's showWelcomeModal
  return (
    <Dialog open={uiActions.showWelcomeModal} onOpenChange={(isOpen) => {
        if (!isOpen) {
            handleCloseOrSkip(); 
        } else {
            uiActions.setShowWelcomeModal(true);
        }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to the Landing Page Builder!</DialogTitle>
          <DialogDescription className="mt-2 text-muted-foreground">
            Let's take a quick tour to show you how to use this tool to create, configure, and
            A/B test your landing pages.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>This guided walkthrough will highlight key features and steps. You can exit at any time.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseOrSkip}>Skip Tour</Button>
          <Button onClick={handleStartTour}>Start Tour</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
