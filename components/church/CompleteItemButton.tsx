"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
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

interface CompleteItemButtonProps {
  itemId: string;
  itemTitle: string;
  claimingChurchName: string;
}

export default function CompleteItemButton({
  itemId,
  itemTitle,
  claimingChurchName,
}: CompleteItemButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/items/${itemId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to complete item");
      }

      const data = await response.json();

      // Show success message based on who completed it
      const completedBy = data.item?.completedBy;
      const completedByChurchName = data.item?.completedByChurchName;

      if (completedBy === "church" && completedByChurchName) {
        toast.success(
          `"${itemTitle}" has been marked as completed by ${completedByChurchName}!`
        );
      } else {
        toast.success(`"${itemTitle}" has been marked as completed!`);
      }

      setIsOpen(false);
      router.refresh(); // Refresh the page to update the UI
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete item"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <CheckCircle className="h-3 w-3 mr-1" />
          )}
          Complete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Item Transfer</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to mark "{itemTitle}" as completed? This will:
            <br />
            <br />
            • Change the item status to COMPLETED
            <br />
            • Remove the contact information from view
            <br />• Complete the transfer to {claimingChurchName}
            <br />
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleComplete}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Transfer
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
