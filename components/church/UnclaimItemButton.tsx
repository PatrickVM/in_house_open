"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UnclaimItemButtonProps {
  itemId: string;
  itemTitle: string;
  claimingChurchName: string;
}

export default function UnclaimItemButton({
  itemId,
  itemTitle,
  claimingChurchName,
}: UnclaimItemButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleUnclaim = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/items/${itemId}/unclaim`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to unclaim item");
      }

      toast.success(`"${itemTitle}" has been unclaimed and is now available!`);
      setIsOpen(false);
      router.refresh(); // Refresh the page to update the UI
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unclaim item"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <X className="h-3 w-3 mr-1" />
          )}
          Unclaim
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unclaim Item</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unclaim "{itemTitle}" from{" "}
            {claimingChurchName}? This will:
            <br />
            <br />
            • Release the claim and make the item available again
            <br />
            • Remove all contact information
            <br />
            • Allow other churches to claim this item
            <br />
            <br />
            You can reclaim this item later if it's still available.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnclaim}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Unclaiming...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Unclaim Item
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
