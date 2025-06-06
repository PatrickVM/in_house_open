"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ClaimButtonProps {
  itemId: string;
  itemStatus: string;
  isClaimedByCurrentChurch: boolean;
  currentChurchId: string;
}

export default function ClaimButton({
  itemId,
  itemStatus,
  isClaimedByCurrentChurch,
  currentChurchId,
}: ClaimButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/items/${itemId}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          churchId: currentChurchId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to claim item");
      }

      toast.success("Item claimed successfully!");
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Error claiming item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to claim item"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnclaim = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/items/${itemId}/unclaim`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to unclaim item");
      }

      toast.success("Item unclaimed successfully!");
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Error unclaiming item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to unclaim item"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if item is completed
  if (itemStatus === "COMPLETED") {
    return null;
  }

  // Show unclaim button if claimed by current church
  if (isClaimedByCurrentChurch) {
    return (
      <Button
        variant="outline"
        onClick={handleUnclaim}
        disabled={isLoading}
        className="text-amber-600 border-amber-200 hover:bg-amber-50"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Unclaim Item
      </Button>
    );
  }

  // Show claim button if item is available
  if (itemStatus === "AVAILABLE") {
    return (
      <Button
        onClick={handleClaim}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Claim Item
      </Button>
    );
  }

  // Item is claimed by another church
  return (
    <Button variant="outline" disabled className="text-gray-500">
      Already Claimed
    </Button>
  );
}
