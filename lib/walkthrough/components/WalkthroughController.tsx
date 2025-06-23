"use client";

import React, { useEffect, useState } from "react";
import { useWalkthrough } from "../useWalkthrough";
import { WalkthroughStepComponent } from "./WalkthroughStep";
import { WalkthroughOverlay } from "./WalkthroughOverlay";

export function WalkthroughController() {
  const {
    isActive,
    isLoading,
    currentStep,
    currentStepIndex,
    totalSteps,
    canGoNext,
    canGoPrev,
    language,
    nextStep,
    prevStep,
    skipStep,
    completeStep,
    exitWalkthrough,
  } = useWalkthrough();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  // Find target element for overlay highlighting
  useEffect(() => {
    if (!currentStep || !isActive) {
      setTargetElement(null);
      return;
    }

    const findElement = () => {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      setTargetElement(element);

      if (element) {
        // Auto-scroll the target element into view for better visibility
        const scrollIntoView = () => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        };

        // Small delay to ensure DOM is ready and animations can start
        setTimeout(scrollIntoView, 200);

        // Debug logging for problematic steps
        if (process.env.NODE_ENV === "development") {
          console.log(`Walkthrough Step ${currentStep.id}:`, {
            target: currentStep.target,
            element: element,
            elementRect: element.getBoundingClientRect(),
            elementVisible: element.offsetWidth > 0 && element.offsetHeight > 0,
            stepType: currentStep.type,
            stepPosition: currentStep.position,
          });
        }
      }

      if (!element) {
        console.warn(
          `Walkthrough: Target element not found: ${currentStep.target}`
        );
      }
    };

    findElement();

    // Retry after a delay for dynamically loaded content
    const retryTimeout = setTimeout(findElement, 500);

    return () => clearTimeout(retryTimeout);
  }, [currentStep, isActive]);

  // Don't render during loading or when inactive
  if (isLoading || !isActive || !currentStep) {
    return null;
  }

  return (
    <>
      {/* Overlay with blur effect */}
      <WalkthroughOverlay
        isVisible={isActive}
        highlightedElement={targetElement}
        onClose={exitWalkthrough}
      />

      {/* Step content */}
      <WalkthroughStepComponent
        step={currentStep}
        language={language}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipStep}
        onComplete={completeStep}
        onExit={exitWalkthrough}
      />
    </>
  );
}
