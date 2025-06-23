"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { WalkthroughStep } from "../walkthroughConfig";
import { getTranslation, SupportedLanguage } from "../helpers/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, ArrowLeft, ArrowRight, SkipForward } from "lucide-react";

interface WalkthroughStepProps {
  step: WalkthroughStep;
  language: SupportedLanguage;
  currentStepIndex: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onExit: () => void;
}

// Mobile utility functions
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};

const getViewportConstrainedPosition = (
  targetRect: DOMRect,
  tooltipSize: { width: number; height: number },
  preferredPosition: string = "right",
  offset: { x: number; y: number } = { x: 0, y: 0 }
) => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const padding = window.innerWidth < 768 ? 40 : 16; // Increased mobile padding for bottom browser UI

  let x = targetRect.left + scrollX;
  let y = targetRect.top + scrollY;
  let finalPosition = preferredPosition;

  // Calculate positions for all directions
  const positions = {
    top: {
      x: targetRect.left + scrollX + targetRect.width / 2,
      y: targetRect.top + scrollY - tooltipSize.height - 10,
      transform: "translateX(-50%)",
    },
    bottom: {
      x: targetRect.left + scrollX + targetRect.width / 2,
      y: targetRect.top + scrollY + targetRect.height + 10,
      transform: "translateX(-50%)",
    },
    left: {
      x: targetRect.left + scrollX - tooltipSize.width - 10,
      y: targetRect.top + scrollY + targetRect.height / 2,
      transform: "translateY(-50%)",
    },
    right: {
      x: targetRect.left + scrollX + targetRect.width + 10,
      y: targetRect.top + scrollY + targetRect.height / 2,
      transform: "translateY(-50%)",
    },
  };

  // Check if preferred position fits in viewport
  const preferredPos = positions[preferredPosition as keyof typeof positions];
  if (preferredPos) {
    const wouldFitInViewport =
      preferredPos.x >= padding &&
      preferredPos.x + tooltipSize.width <= viewport.width - padding &&
      preferredPos.y >= padding &&
      preferredPos.y + tooltipSize.height <= viewport.height - padding;

    if (wouldFitInViewport) {
      return {
        x: preferredPos.x + offset.x,
        y: preferredPos.y + offset.y,
        transform: preferredPos.transform,
        position: preferredPosition,
      };
    }
  }

  // Try alternative positions if preferred doesn't fit
  const positionPriority = ["bottom", "top", "right", "left"];
  for (const pos of positionPriority) {
    if (pos === preferredPosition) continue;

    const testPos = positions[pos as keyof typeof positions];
    if (testPos) {
      const wouldFitInViewport =
        testPos.x >= padding &&
        testPos.x + tooltipSize.width <= viewport.width - padding &&
        testPos.y >= padding &&
        testPos.y + tooltipSize.height <= viewport.height - padding;

      if (wouldFitInViewport) {
        return {
          x: testPos.x + offset.x,
          y: testPos.y + offset.y,
          transform: testPos.transform,
          position: pos,
        };
      }
    }
  }

  // Fallback: center on mobile if nothing fits
  return {
    x: viewport.width / 2,
    y: Math.max(
      padding,
      Math.min(
        targetRect.top + scrollY,
        viewport.height - tooltipSize.height - padding
      )
    ),
    transform: "translateX(-50%)",
    position: "center",
  };
};

export function WalkthroughStepComponent({
  step,
  language,
  currentStepIndex,
  totalSteps,
  canGoNext,
  canGoPrev,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  onExit,
}: WalkthroughStepProps) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    transform: "",
    position: "right",
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const content = getTranslation(step.content, language);
  const isModal = step.type === "modal";
  const isTooltip = step.type === "tooltip";

  // Find and position relative to target element
  useEffect(() => {
    const findTargetElement = () => {
      const element = document.querySelector(step.target) as HTMLElement;
      setTargetElement(element);

      if (element && isTooltip) {
        // Auto-scroll the target element into view
        const scrollIntoView = () => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        };

        // Small delay to ensure DOM is ready
        setTimeout(scrollIntoView, 100);

        const updatePosition = () => {
          const rect = element.getBoundingClientRect();

          // Mobile-optimized tooltip sizing
          const tooltipSize = isMobile
            ? { width: Math.min(320, window.innerWidth - 32), height: 200 }
            : { width: 50, height: 200 };

          // Get smart positioning that respects viewport boundaries
          const smartPosition = getViewportConstrainedPosition(
            rect,
            tooltipSize,
            step.position || "right",
            step.offset || { x: 0, y: 0 }
          );

          setPosition(smartPosition);
        };

        updatePosition();

        // Listen for scroll events to update position
        const handleScroll = () => {
          updatePosition();
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        document.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
          window.removeEventListener("scroll", handleScroll);
          document.removeEventListener("scroll", handleScroll);
        };
      }
    };

    findTargetElement();

    // Retry finding element after a delay (for dynamically loaded content)
    const retryTimeout = setTimeout(findTargetElement, 500);

    // Listen for resize events to recalculate position on mobile
    const handleResize = () => {
      if (targetElement && isTooltip) {
        findTargetElement();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      clearTimeout(retryTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [
    step.target,
    step.position,
    step.offset,
    isTooltip,
    targetElement,
    isMobile,
  ]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          onExit();
          break;
        case "ArrowRight":
        case "Enter":
          event.preventDefault();
          onComplete();
          break;
        case "ArrowLeft":
          if (canGoPrev) {
            event.preventDefault();
            onPrev();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onExit, onComplete, onPrev, canGoPrev]);

  const StepActions = () => (
    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-600">
      <div className="flex items-center gap-1 md:gap-2">
        {/* Removed step counter */}
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {canGoPrev && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            className="text-xs md:text-sm px-2 md:px-3 border-slate-500 text-white hover:bg-slate-600 hover:border-slate-400 bg-slate-700 font-medium"
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Back
          </Button>
        )}

        <Button
          size="sm"
          onClick={onComplete}
          className="text-xs md:text-sm px-3 md:px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl font-medium transition-all border border-indigo-500"
        >
          {canGoNext ? (
            <>
              Next
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
            </>
          ) : (
            "Complete"
          )}
        </Button>
      </div>
    </div>
  );

  // Modal type
  if (isModal) {
    return (
      <Dialog open={true} onOpenChange={() => onExit()}>
        <DialogContent
          className={`bg-slate-900 border-2 border-indigo-400 shadow-2xl ${
            isMobile ? "w-80 h-80" : "w-[90vw] max-w-md"
          }`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white font-semibold text-sm md:text-base">
              🎉 Welcome to InHouse
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4 bg-slate-800 p-3 md:p-4 rounded-lg border border-slate-700">
            <p className="text-xs md:text-sm text-white leading-relaxed font-medium">
              {content}
            </p>

            <StepActions />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Tooltip type
  if (isTooltip && targetElement) {
    // Get arrow direction based on final position
    const getArrowClasses = (pos: string) => {
      switch (pos) {
        case "top":
          return "border-t-slate-900 border-x-transparent border-b-transparent top-full left-1/2 -translate-x-1/2";
        case "bottom":
          return "border-b-slate-900 border-x-transparent border-t-transparent bottom-full left-1/2 -translate-x-1/2";
        case "left":
          return "border-l-slate-900 border-y-transparent border-r-transparent left-full top-1/2 -translate-y-1/2";
        case "right":
          return "border-r-slate-900 border-y-transparent border-l-transparent right-full top-1/2 -translate-y-1/2";
        default:
          return "border-b-slate-900 border-x-transparent border-t-transparent bottom-full left-1/2 -translate-x-1/2";
      }
    };

    return createPortal(
      <div
        ref={contentRef}
        className={`fixed z-[9999] pointer-events-auto ${isMobile ? "touch-manipulation" : ""}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: position.transform,
          maxWidth: isMobile ? "calc(100vw - 32px)" : "auto",
        }}
      >
        <Card
          className={`shadow-2xl border-2 border-indigo-400 bg-slate-900 backdrop-blur-none ${
            isMobile
              ? "w-[calc(100vw-32px)] max-w-sm"
              : "w-[90vw] max-w-xs md:max-w-sm lg:w-80"
          }`}
        >
          <CardHeader className="pb-2 md:pb-3 bg-gray-800 border-b border-slate-700">
            <CardTitle className="text-sm md:text-base flex items-center justify-between text-white font-semibold">
              ✨ Step {currentStepIndex + 1}
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className={`p-0 text-white hover:text-white hover:bg-slate-600 rounded-full border border-slate-600 ${
                  isMobile ? "h-8 w-8" : "h-5 w-5 md:h-6 md:w-6"
                }`}
              >
                <X
                  className={`${isMobile ? "h-5 w-5" : "h-3 w-3 md:h-4 md:w-4"}`}
                />
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-3 md:pt-4 bg-gray-800 p-3 md:p-6">
            <p className="text-xs md:text-sm text-white leading-relaxed mb-3 md:mb-4 font-medium">
              {content}
            </p>

            <StepActions />
          </CardContent>
        </Card>

        {/* Arrow pointing to target element - hide on mobile center position */}
        {position.position !== "center" && (
          <div
            className={`absolute w-0 h-0 ${isMobile ? "border-4" : "border-6 md:border-8"} ${getArrowClasses(position.position)}`}
          />
        )}
      </div>,
      document.body
    );
  }

  return null;
}
