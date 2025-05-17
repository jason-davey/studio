
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
import { useWalkthrough } from '@/contexts/WalkthroughContext'; // Ensure this path is correct

export default function WelcomeModal() {
  const { showWelcomeModal, setShowWelcomeModal, actuallyStartWalkthrough, endWalkthrough } = useWalkthrough();

  const handleStartTour = () => {
    setShowWelcomeModal(false);
    if(actuallyStartWalkthrough) {
      actuallyStartWalkthrough(); // Ensure this function exists and is called
    }
  };

  const handleClose = () => {
    setShowWelcomeModal(false);
    endWalkthrough(); // End the tour if they close the welcome modal without starting
  }

  return (
    <Dialog open={showWelcomeModal} onOpenChange={(isOpen) => {
        if (!isOpen) {
            handleClose(); // If dialog is closed by other means (e.g. ESC), treat as ending.
        } else {
            setShowWelcomeModal(true);
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
          <Button variant="outline" onClick={handleClose}>Skip Tour</Button>
          <Button onClick={handleStartTour}>Start Tour</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    