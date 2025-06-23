import { WALKTHROUGH_VERSION } from "../walkthroughConfig";

export interface WalkthroughStorageData {
  currentStepIndex: number;
  completedSteps: string[];
  skippedSteps: string[];
  version: string;
  lastActiveAt: number;
}

const STORAGE_KEY = "inhouse_walkthrough";
const STORAGE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Local Storage Functions
export function getLocalWalkthroughData(): WalkthroughStorageData | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as WalkthroughStorageData & {
      expiresAt: number;
    };

    // Check if data is expired
    if (data.expiresAt && Date.now() > data.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return {
      currentStepIndex: data.currentStepIndex,
      completedSteps: data.completedSteps,
      skippedSteps: data.skippedSteps,
      version: data.version,
      lastActiveAt: data.lastActiveAt,
    };
  } catch (error) {
    console.error("Error reading walkthrough data from localStorage:", error);
    return null;
  }
}

export function saveLocalWalkthroughData(data: WalkthroughStorageData): void {
  if (typeof window === "undefined") return;

  try {
    const dataWithExpiry = {
      ...data,
      expiresAt: Date.now() + STORAGE_EXPIRY,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithExpiry));
  } catch (error) {
    console.error("Error saving walkthrough data to localStorage:", error);
  }
}

export function clearLocalWalkthroughData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// API-based Database Functions
export async function getUserWalkthroughProgress(): Promise<{
  completedSteps: string[];
  skippedSteps: string[];
  isFirstTime: boolean;
} | null> {
  try {
    const response = await fetch("/api/walkthrough/progress", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      completedSteps: data.completedSteps || [],
      skippedSteps: data.skippedSteps || [],
      isFirstTime: data.isFirstTime || false,
    };
  } catch (error) {
    console.error("Error fetching walkthrough progress:", error);
    // Fallback to localStorage
    const localData = getLocalWalkthroughData();
    if (localData) {
      return {
        completedSteps: localData.completedSteps,
        skippedSteps: localData.skippedSteps,
        isFirstTime: localData.completedSteps.length === 0,
      };
    }
    return { completedSteps: [], skippedSteps: [], isFirstTime: true };
  }
}

export async function saveStepProgress(
  stepId: string,
  completed: boolean,
  skipped: boolean = false
): Promise<void> {
  try {
    const response = await fetch("/api/walkthrough/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stepId,
        completed,
        skipped,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Also save to localStorage as backup
    const localData = getLocalWalkthroughData();
    if (localData) {
      const updatedData = { ...localData };

      if (completed) {
        if (!updatedData.completedSteps.includes(stepId)) {
          updatedData.completedSteps.push(stepId);
        }
      } else if (skipped) {
        if (!updatedData.skippedSteps.includes(stepId)) {
          updatedData.skippedSteps.push(stepId);
        }
      }

      saveLocalWalkthroughData(updatedData);
    }
  } catch (error) {
    console.error("Error saving step progress:", error);
    throw error;
  }
}

export async function isFirstTimeUser(): Promise<boolean> {
  try {
    const progress = await getUserWalkthroughProgress();
    return progress?.isFirstTime || true;
  } catch (error) {
    console.error("Error checking first time user:", error);
    // Fallback to localStorage check
    const localData = getLocalWalkthroughData();
    return !localData || localData.completedSteps.length === 0;
  }
}

export async function resetWalkthroughProgress(): Promise<void> {
  try {
    const response = await fetch("/api/walkthrough/progress", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    clearLocalWalkthroughData();
  } catch (error) {
    console.error("Error resetting walkthrough progress:", error);
    throw error;
  }
}
