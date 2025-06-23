"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import {
  WalkthroughStep,
  getStepsForRole,
  getMobileOptimizedStepsForRole,
  WALKTHROUGH_VERSION,
} from "./walkthroughConfig";
import { UserRole } from "@/auth";
import {
  getLocalWalkthroughData,
  saveLocalWalkthroughData,
  saveStepProgress,
  isFirstTimeUser,
  WalkthroughStorageData,
} from "./helpers/storage";
import {
  logWalkthroughStart,
  logWalkthroughComplete,
  logWalkthroughSkip,
  logWalkthroughError,
} from "./helpers/analytics";
import {
  getStoredLanguage,
  getTranslation,
  SupportedLanguage,
} from "./helpers/i18n";

export interface WalkthroughState {
  isActive: boolean;
  isLoading: boolean;
  currentStep: WalkthroughStep | null;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  language: SupportedLanguage;
}

export interface WalkthroughActions {
  startWalkthrough: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  completeStep: () => void;
  exitWalkthrough: () => void;
  restartWalkthrough: () => void;
  setLanguage: (lang: SupportedLanguage) => void;
}

export function useWalkthrough(): WalkthroughState & WalkthroughActions {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [userSteps, setUserSteps] = useState<WalkthroughStep[]>([]);

  const initializingRef = useRef(false);

  // Get current page steps
  const pageSteps = userSteps.filter((step) => step.page === pathname);
  const currentStep = pageSteps[currentStepIndex] || null;

  const totalSteps = pageSteps.length;
  const progress =
    totalSteps > 0
      ? Math.round(((currentStepIndex + 1) / totalSteps) * 100)
      : 0;
  const canGoNext = currentStepIndex < totalSteps - 1;
  const canGoPrev = currentStepIndex > 0;

  // Initialize walkthrough
  const initialize = useCallback(async () => {
    if (!session?.user || initializingRef.current) return;

    initializingRef.current = true;
    setIsLoading(true);

    try {
      const userRole = session.user.role as UserRole;
      const userId = session.user.id;

      // Check if mobile
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

      // Get user's steps for their role (mobile-optimized if on mobile)
      const steps = getMobileOptimizedStepsForRole(userRole, isMobile);
      setUserSteps(steps);

      // Set language
      setLanguageState(getStoredLanguage());

      // Check if this is first time user
      const isFirstTime = await isFirstTimeUser();

      if (isFirstTime && steps.length > 0) {
        // Start walkthrough for first-time users
        await logWalkthroughStart(userId, userRole, steps[0].id);
        setIsActive(true);
        setCurrentStepIndex(0);

        // Save initial state
        const storageData: WalkthroughStorageData = {
          currentStepIndex: 0,
          completedSteps: [],
          skippedSteps: [],
          version: WALKTHROUGH_VERSION,
          lastActiveAt: Date.now(),
        };
        saveLocalWalkthroughData(storageData);
      } else {
        // Load existing progress
        const localData = getLocalWalkthroughData();
        if (localData) {
          setCurrentStepIndex(localData.currentStepIndex);
        }
      }
    } catch (error) {
      console.error("Error initializing walkthrough:", error);
      if (session?.user) {
        await logWalkthroughError(
          session.user.id,
          session.user.role,
          "initialization",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    } finally {
      setIsLoading(false);
      initializingRef.current = false;
    }
  }, [session]);

  // Initialize on session change
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle step navigation
  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= pageSteps.length) return;

      setCurrentStepIndex(stepIndex);

      // Update local storage
      const localData = getLocalWalkthroughData();
      if (localData) {
        saveLocalWalkthroughData({
          ...localData,
          currentStepIndex: stepIndex,
          lastActiveAt: Date.now(),
        });
      }
    },
    [pageSteps.length]
  );

  const startWalkthrough = useCallback(() => {
    if (!session?.user || userSteps.length === 0) return;

    setIsActive(true);
    setCurrentStepIndex(0);

    logWalkthroughStart(session.user.id, session.user.role, userSteps[0].id);
  }, [session, userSteps]);

  const nextStep = useCallback(() => {
    if (canGoNext) {
      goToStep(currentStepIndex + 1);
    } else {
      // Completed all steps
      exitWalkthrough();
    }
  }, [canGoNext, currentStepIndex, goToStep]);

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      goToStep(currentStepIndex - 1);
    }
  }, [canGoPrev, currentStepIndex, goToStep]);

  const completeStep = useCallback(async () => {
    if (!session?.user || !currentStep) return;

    try {
      await saveStepProgress(currentStep.id, true, false);
      await logWalkthroughComplete(
        session.user.id,
        session.user.role,
        currentStep.id
      );

      // Update local storage
      const localData = getLocalWalkthroughData();
      if (localData) {
        const updatedData = {
          ...localData,
          completedSteps: [...localData.completedSteps, currentStep.id],
          lastActiveAt: Date.now(),
        };
        saveLocalWalkthroughData(updatedData);
      }

      nextStep();
    } catch (error) {
      console.error("Error completing step:", error);
      await logWalkthroughError(
        session.user.id,
        session.user.role,
        currentStep.id,
        error instanceof Error ? error.message : "Failed to complete step"
      );
    }
  }, [session, currentStep, nextStep]);

  const skipStep = useCallback(async () => {
    if (!session?.user || !currentStep) return;

    try {
      await saveStepProgress(currentStep.id, false, true);
      await logWalkthroughSkip(
        session.user.id,
        session.user.role,
        currentStep.id
      );

      // Update local storage
      const localData = getLocalWalkthroughData();
      if (localData) {
        const updatedData = {
          ...localData,
          skippedSteps: [...localData.skippedSteps, currentStep.id],
          lastActiveAt: Date.now(),
        };
        saveLocalWalkthroughData(updatedData);
      }

      nextStep();
    } catch (error) {
      console.error("Error skipping step:", error);
      await logWalkthroughError(
        session.user.id,
        session.user.role,
        currentStep.id,
        error instanceof Error ? error.message : "Failed to skip step"
      );
    }
  }, [session, currentStep, nextStep]);

  const exitWalkthrough = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const restartWalkthrough = useCallback(() => {
    if (!session?.user) return;

    setCurrentStepIndex(0);
    setIsActive(true);

    // Clear local storage
    const storageData: WalkthroughStorageData = {
      currentStepIndex: 0,
      completedSteps: [],
      skippedSteps: [],
      version: WALKTHROUGH_VERSION,
      lastActiveAt: Date.now(),
    };
    saveLocalWalkthroughData(storageData);

    if (userSteps.length > 0) {
      logWalkthroughStart(session.user.id, session.user.role, userSteps[0].id);
    }
  }, [session, userSteps]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
  }, []);

  return {
    // State
    isActive,
    isLoading,
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    canGoNext,
    canGoPrev,
    language,

    // Actions
    startWalkthrough,
    nextStep,
    prevStep,
    skipStep,
    completeStep,
    exitWalkthrough,
    restartWalkthrough,
    setLanguage,
  };
}
