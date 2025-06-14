"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
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

interface MessageDeleteButtonProps {
  messageId: string;
  messageTitle?: string | null;
  messageStatus: string;
  disabled?: boolean;
}

export default function MessageDeleteButton({
  messageId,
  messageTitle,
  messageStatus,
  disabled = false,
}: MessageDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/church/messages/${messageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete message");
      }

      toast.success("Message deleted successfully");
      setShowDialog(false);
      router.refresh(); // Refresh the page to update the list
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete message"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Don't show delete button for published or expired messages
  if (messageStatus === "PUBLISHED" || messageStatus === "EXPIRED") {
    return null;
  }

  const displayTitle = messageTitle || "Untitled Message";

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isDeleting}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Message</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this message? This action cannot be
            undone.
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800">
                Message: "{displayTitle}"
              </p>
              <p className="text-sm text-red-700 mt-1">
                Status: {messageStatus}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Message
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
