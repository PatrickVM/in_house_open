"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface WalkthroughOverlayProps {
  isVisible: boolean;
  highlightedElement?: HTMLElement | null;
  onClose?: () => void;
}

export function WalkthroughOverlay({
  isVisible,
  highlightedElement,
  onClose,
}: WalkthroughOverlayProps) {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Update highlight position on scroll or resize
  useEffect(() => {
    if (!isVisible || !highlightedElement) {
      setHighlightRect(null);
      return;
    }

    const updateHighlightRect = () => {
      const rect = highlightedElement.getBoundingClientRect();
      setHighlightRect(rect);
    };

    // Initial calculation
    updateHighlightRect();

    // Listen for scroll and resize events
    const handleUpdate = () => {
      updateHighlightRect();
    };

    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate);
    document.addEventListener("scroll", handleUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
      document.removeEventListener("scroll", handleUpdate);
    };
  }, [isVisible, highlightedElement]);

  if (!isVisible || typeof window === "undefined") return null;

  const handleInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    // Prevent interaction with the overlay from affecting underlying elements
    event.stopPropagation();
    if (onClose) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] pointer-events-auto touch-manipulation"
      style={{ isolation: "isolate" }}
    >
      {/* Blur overlay with cutout for highlighted element */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-all duration-300 cursor-pointer"
        onClick={handleInteraction}
        onTouchEnd={handleInteraction}
        role="button"
        tabIndex={0}
        aria-label="Close walkthrough"
      />

      {/* Highlighted element cutout */}
      {highlightRect && (
        <>
          {/* Top */}
          <div
            className="absolute bg-slate-900/80 backdrop-blur-sm pointer-events-none"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: `${highlightRect.top}px`,
            }}
          />

          {/* Bottom */}
          <div
            className="absolute bg-slate-900/80 backdrop-blur-sm pointer-events-none"
            style={{
              top: `${highlightRect.bottom}px`,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Left */}
          <div
            className="absolute bg-slate-900/80 backdrop-blur-sm pointer-events-none"
            style={{
              top: `${highlightRect.top}px`,
              left: 0,
              width: `${highlightRect.left}px`,
              height: `${highlightRect.height}px`,
            }}
          />

          {/* Right */}
          <div
            className="absolute bg-slate-900/80 backdrop-blur-sm pointer-events-none"
            style={{
              top: `${highlightRect.top}px`,
              left: `${highlightRect.right}px`,
              right: 0,
              height: `${highlightRect.height}px`,
            }}
          />

          {/* Highlight border around element with animated glow */}
          <div
            className="absolute border-2 border-indigo-400 rounded-lg shadow-lg pointer-events-none animate-pulse"
            style={{
              top: `${highlightRect.top - 4}px`,
              left: `${highlightRect.left - 4}px`,
              width: `${highlightRect.width + 8}px`,
              height: `${highlightRect.height + 8}px`,
              boxShadow: `0 0 20px rgba(99, 102, 241, 0.7), 0 0 40px rgba(99, 102, 241, 0.5)`,
            }}
          />

          {/* Additional inner glow for more visual impact */}
          <div
            className="absolute border border-indigo-300 rounded-lg pointer-events-none opacity-80"
            style={{
              top: `${highlightRect.top - 2}px`,
              left: `${highlightRect.left - 2}px`,
              width: `${highlightRect.width + 4}px`,
              height: `${highlightRect.height + 4}px`,
            }}
          />
        </>
      )}
    </div>,
    document.body
  );
}
