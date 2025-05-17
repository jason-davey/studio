
'use client';

import type { PageBlueprint } from '@/types/recommendations';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// Define the shape of a single walkthrough step
export interface WalkthroughStep {
  id: string; // Unique ID for the step, can be used for targeting accordion
  selector: string; // CSS selector for the element to highlight
  title: string;
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  requiresAccordionOpen?: string; // Value of the accordion item that needs to be open
  autoLoadBlueprint?: boolean; // If true, loads a sample blueprint for this step
}

interface WalkthroughContextType {
  isWalkthroughActive: boolean;
  currentStepIndex: number;
  showWelcomeModal: boolean;
  steps: WalkthroughStep[];
  startWalkthrough: () => void;
  endWalkthrough: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  setShowWelcomeModal: (show: boolean) => void;
  setAccordionToOpen: (accordionValue: string | undefined) => void; // To control accordion from context
  autoLoadSampleBlueprint: () => void; // To load sample data
  actuallyStartWalkthrough?: () => void; // Made optional as it's mainly for internal use after modal
}

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined);

// Sample blueprint (can be moved or made more dynamic later)
const sampleBlueprintForWalkthrough: PageBlueprint = {
  pageName: "SecureTomorrow Life Insurance - Walkthrough Sample",
  targetUrl: "https://www.realinsurance.com.au/lp/life-form",
  seoTitle: "Secure Your Family's Future | Real Insurance",
  heroConfig: {
    headline: "Walkthrough: Ensure Your Family's Security",
    subHeadline: "(A guided example of creating great content)",
    ctaText: "Explore Features",
    uniqueValueProposition: "This is a sample UVP for the walkthrough.",
    heroImageUrl: "https://placehold.co/1600x900.png",
    heroImageAltText: "Walkthrough sample image"
  },
  benefits: [
    { icon: "Clock", title: "Sample Benefit 1", description: "Description for sample benefit 1." },
    { icon: "ShieldCheck", title: "Sample Benefit 2", description: "Description for sample benefit 2." }
  ],
  testimonials: [
    { name: "Walkthrough User", location: "Guideland", avatarImageUrl: "https://placehold.co/100x100.png", avatarInitial: "WU", quote: "This walkthrough is helping me learn!", since: "Just now" }
  ],
  trustSignals: [
    { type: "award", text: "Best Onboarding Award (Sample)", imageUrl: "https://placehold.co/150x50.png" }
  ],
  formConfig: {
    headline: "Sample Form Headline for Walkthrough",
    ctaText: "Sample Form CTA"
  }
};


export const walkthroughStepsDefinition: WalkthroughStep[] = [
  {
    id: 'step-1-intro',
    selector: '#step-1-accordion-trigger', // Target the trigger for Step 1
    title: 'Step 1: Review Recommendations',
    content: 'This is where you start! Upload a JSON "Page Blueprint" file if you have one from an external recommendations tool. This can pre-fill content for all sections.',
    placement: 'bottom',
    requiresAccordionOpen: 'step-1',
    autoLoadBlueprint: true,
  },
  {
    id: 'step-1-upload',
    selector: '#blueprint-upload-input', // Assuming your file input has this ID
    title: 'Upload Your Blueprint',
    content: 'Click here to select and upload your JSON blueprint file. For this tour, we\'ve pre-loaded a sample for you!',
    placement: 'bottom',
    requiresAccordionOpen: 'step-1',
  },
  {
    id: 'step-2-intro',
    selector: '#step-2-accordion-trigger',
    title: 'Step 2: Build & Preview Page',
    content: 'See a preview of your landing page (Hero, Benefits, Testimonials, etc.) based on the blueprint. Scroll down to see all sections.',
    placement: 'bottom',
    requiresAccordionOpen: 'step-2',
  },
  {
    id: 'step-3-intro',
    selector: '#step-3-accordion-trigger',
    title: 'Step 3: Adjust Content',
    content: 'Fine-tune the content of your landing page sections. You can edit headlines, descriptions, and more.',
    placement: 'bottom',
    requiresAccordionOpen: 'step-3',
  },
   {
    id: 'step-3-hero-adjust',
    selector: '#heroHeadline-input', // Target a specific input in step 3
    title: 'Adjusting Hero Headline',
    content: 'For example, you can edit the main Hero Headline here. Changes will reflect in the Step 2 preview.',
    placement: 'bottom',
    requiresAccordionOpen: 'step-3',
  },
  {
    id: 'step-4-intro',
    selector: '#step-4-accordion-trigger',
    title: 'Step 4: Configure A/B Test',
    content: 'Create "Version A" and "Version B" for A/B testing, focusing on the Hero section. Use AI suggestions and manage configurations locally.',
    placement: 'bottom',
    requiresAccordionOpen: 'step-4',
  },
  {
    id: 'step-4-ai-suggest',
    selector: '#ai-suggest-headlineA-button', // Example ID for an AI button
    title: 'AI Content Suggestions',
    content: 'Use the ✨ AI buttons to get suggestions for headlines, sub-headlines, and CTAs. You can also provide a "Campaign Focus" to guide the AI.',
    placement: 'bottom',
    requiresAccordionOpen: 'step-4',
  },
  {
    id: 'step-4-preview-ab',
    selector: '#render-ab-preview-button',
    title: 'Preview A/B Versions',
    content: 'Once you have configured Version A and B, click this button to see them side-by-side on a new page.',
    placement: 'top',
    requiresAccordionOpen: 'step-4',
  },
  {
    id: 'step-5-intro',
    selector: '#step-5-accordion-trigger',
    title: 'Step 5: Prepare for Deployment',
    content: 'Get instructions and links to take your A/B test configurations to Firebase. Consult the PLAYBOOK.md for details.',
    placement: 'top',
    requiresAccordionOpen: 'step-5',
  },
  {
    id: 'walkthrough-end',
    selector: '#walkthrough-end-target', // A dummy selector or a real one if you have a final "well done" spot
    title: 'Tour Complete!',
    content: 'You\'ve completed the guided tour! You can restart this tour anytime from the help button in the header. Now you\'re ready to build amazing landing pages.',
    placement: 'center',
  }
];

// Props for the provider
interface WalkthroughProviderProps {
  children: ReactNode;
  onAccordionChange: (value: string | undefined) => void; // Callback to open accordion items
  onLoadBlueprint: (blueprint: PageBlueprint) => void; // Callback to load blueprint in main page
}


export const WalkthroughProvider: React.FC<WalkthroughProviderProps> = ({ children, onAccordionChange, onLoadBlueprint }) => {
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const steps = walkthroughStepsDefinition;

  const handleStepChangeLogic = useCallback((newStepIndex: number) => {
    if (newStepIndex >= 0 && newStepIndex < steps.length) {
      const currentStepDetails = steps[newStepIndex];
      if (currentStepDetails.requiresAccordionOpen) {
        onAccordionChange(currentStepDetails.requiresAccordionOpen);
      }
      // Auto-load blueprint handled by actuallyStartWalkthrough and useEffect
      setCurrentStepIndex(newStepIndex);
    }
  }, [steps, onAccordionChange]);


  const startWalkthrough = useCallback(() => {
    setShowWelcomeModal(true);
    // Actual start (setting step 0) will happen after welcome modal is closed
  }, []);

  const effectivelyStartWalkthrough = useCallback(() => {
    setIsWalkthroughActive(true);
    // Check if the first step requires blueprint loading
    if (steps[0]?.autoLoadBlueprint) {
      onLoadBlueprint(sampleBlueprintForWalkthrough);
    }
    // Open accordion for the first step if needed
    if (steps[0]?.requiresAccordionOpen) {
        onAccordionChange(steps[0].requiresAccordionOpen);
    }
    setCurrentStepIndex(0); // Explicitly set to first step
  }, [steps, onLoadBlueprint, onAccordionChange]);

  const endWalkthrough = useCallback(() => {
    setIsWalkthroughActive(false);
    setCurrentStepIndex(0);
    setShowWelcomeModal(false);
    onAccordionChange(undefined); // Optionally close all accordions or reset to default
  }, [onAccordionChange]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      handleStepChangeLogic(currentStepIndex + 1);
    } else {
      endWalkthrough(); // End tour if it's the last step
    }
  }, [currentStepIndex, steps.length, endWalkthrough, handleStepChangeLogic]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      handleStepChangeLogic(currentStepIndex - 1);
    }
  }, [currentStepIndex, handleStepChangeLogic]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      handleStepChangeLogic(index);
    }
  }, [steps, handleStepChangeLogic]);
  
  const autoLoadSampleBlueprint = useCallback(() => {
      onLoadBlueprint(sampleBlueprintForWalkthrough);
  }, [onLoadBlueprint]);


  // This effect handles the auto-loading when the walkthrough becomes active
  // and the modal is not shown (meaning it was just closed to start the tour)
  useEffect(() => {
    if (isWalkthroughActive && !showWelcomeModal && currentStepIndex === 0) {
        // This logic is now part of `effectivelyStartWalkthrough`
        // to ensure it happens exactly once when the tour truly begins.
    }
  }, [isWalkthroughActive, showWelcomeModal, currentStepIndex, steps, autoLoadSampleBlueprint, effectivelyStartWalkthrough, onAccordionChange]);


  const value = {
    isWalkthroughActive,
    currentStepIndex,
    showWelcomeModal,
    steps,
    startWalkthrough, // This will just show the modal
    actuallyStartWalkthrough: effectivelyStartWalkthrough, // This starts the tour steps
    endWalkthrough,
    nextStep,
    prevStep,
    goToStep,
    setShowWelcomeModal,
    setAccordionToOpen: onAccordionChange, 
    autoLoadSampleBlueprint,
  };

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
    </WalkthroughContext.Provider>
  );
};

export const useWalkthrough = (): WalkthroughContextType => {
  const context = useContext(WalkthroughContext);
  if (context === undefined) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  }
  return context;
};

