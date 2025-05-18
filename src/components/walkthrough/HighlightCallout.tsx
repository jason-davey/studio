
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { WalkthroughStep } from '@/contexts/WalkthroughContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HighlightCalloutProps {
  step: WalkthroughStep | undefined;
  onNext: () => void;
  onPrev: () => void;
  onEnd: () => void;
  totalSteps: number;
  currentStepNumber: number; // 1-based index for display
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 10; // Padding around the highlighted element

export default function HighlightCallout({ step, onNext, onPrev, onEnd, totalSteps, currentStepNumber }: HighlightCalloutProps) {
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const calloutRef = useRef<HTMLDivElement>(null);
  const [calloutPosition, setCalloutPosition] = useState<{ top?: number; left?: number; right?: number; bottom?: number }>({});

  useEffect(() => {
    if (!step || !step.selector) {
      setTargetRect(null);
      // For "center" placement when no selector (like end screen)
      if (step?.placement === 'center') {
         setTargetRect({ top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0});
      }
      return;
    }

    const element = document.querySelector(step.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    } else {
      console.warn(`Walkthrough: Element with selector "${step.selector}" not found.`);
      setTargetRect(null); // Fallback if element not found
    }
  }, [step]);

  useEffect(() => {
    if (!targetRect || !step || !calloutRef.current) {
        // Center the callout if it's a center-placed step (like end screen) or no target
        if (step?.placement === 'center' || !targetRect) {
             setCalloutPosition({
                top: window.innerHeight / 2 - (calloutRef.current?.offsetHeight || 200) / 2,
                left: window.innerWidth / 2 - (calloutRef.current?.offsetWidth || 300) / 2,
            });
        }
      return;
    }

    const calloutHeight = calloutRef.current.offsetHeight;
    const calloutWidth = calloutRef.current.offsetWidth;
    const space = 20; // Space between target and callout

    let pos: { top?: number; left?: number; right?: number; bottom?: number } = {};

    switch (step.placement) {
      case 'top':
        pos.top = targetRect.top - calloutHeight - space;
        pos.left = targetRect.left + targetRect.width / 2 - calloutWidth / 2;
        break;
      case 'bottom':
        pos.top = targetRect.top + targetRect.height + space;
        pos.left = targetRect.left + targetRect.width / 2 - calloutWidth / 2;
        break;
      case 'left':
        pos.top = targetRect.top + targetRect.height / 2 - calloutHeight / 2;
        pos.left = targetRect.left - calloutWidth - space;
        break;
      case 'right':
        pos.top = targetRect.top + targetRect.height / 2 - calloutHeight / 2;
        pos.left = targetRect.left + targetRect.width + space;
        break;
      case 'center':
      default: // Default to center if no placement or if element not found
        pos.top = window.innerHeight / 2 - calloutHeight / 2 + window.scrollY;
        pos.left = window.innerWidth / 2 - calloutWidth / 2 + window.scrollX;
        break;
    }

    // Adjust if out of bounds
    if (pos.left && pos.left < PADDING) pos.left = PADDING;
    if (pos.left && calloutWidth && pos.left + calloutWidth > window.innerWidth - PADDING) {
      pos.left = window.innerWidth - calloutWidth - PADDING;
    }
    if (pos.top && pos.top < PADDING) pos.top = PADDING;
    if (pos.top && calloutHeight && pos.top + calloutHeight > window.innerHeight - PADDING + window.scrollY) {
       pos.top = window.innerHeight - calloutHeight - PADDING + window.scrollY;
    }


    setCalloutPosition(pos);
  }, [targetRect, step, step?.placement]);


  if (!step) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000, // Ensure it's above other content but below callout
  };

  const holeStyle: React.CSSProperties = targetRect && step.placement !== 'center' ? {
    position: 'absolute',
    top: targetRect.top - PADDING,
    left: targetRect.left - PADDING,
    width: targetRect.width + PADDING * 2,
    height: targetRect.height + PADDING * 2,
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
    borderRadius: '4px', // Optional: if you want rounded corners for the hole
    zIndex: 1001, // Above overlay, below callout
  } : { display: 'none'}; // No hole if centered or no target

  const calloutBaseStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 1002, // Above hole and overlay
    width: '320px', // Standard width for callout
    // transition for smooth movement, though might be jumpy if targetRect changes drastically
    // transition: 'top 0.3s ease-out, left 0.3s ease-out', 
  };

  const combinedCalloutStyle = { ...calloutBaseStyle, ...calloutPosition };


  return (
    <>
      <div style={overlayStyle} onClick={onEnd} />
      {targetRect && step.placement !== 'center' && <div style={holeStyle} />}
      
      <div ref={calloutRef} style={combinedCalloutStyle}>
        <Card className="shadow-2xl border-primary border-2">
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg text-primary">{step.title}</CardTitle>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={onEnd}>
              <X className="h-4 w-4" />
              <span className="sr-only">End Tour</span>
            </Button>
          </CardHeader>
          <CardContent className="text-sm">
            {typeof step.content === 'string' ? <p>{step.content}</p> : step.content}
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-3">
            <span className="text-xs text-muted-foreground">
              Step {currentStepNumber} of {totalSteps}
            </span>
            <div className="flex gap-2">
              {currentStepNumber > 1 && (
                <Button variant="outline" size="sm" onClick={onPrev}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
              )}
              {currentStepNumber < totalSteps ? (
                <Button size="sm" onClick={onNext}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={onEnd}>
                  Finish Tour
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
