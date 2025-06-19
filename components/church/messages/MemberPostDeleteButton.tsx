"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MemberPostDeleteButtonProps {
  messageId: string;
  size?: "sm" | "default";
}

export default function MemberPostDeleteButton({
  messageId,
  size = "sm",
}: MemberPostDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/user/messages/${messageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete member post");
      }

      toast.success("Member post deleted successfully");
      setDialogOpen(false);
      router.refresh(); // Refresh the page to update the list
    } catch (error) {
      console.error("Error deleting member post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete member post"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-auto p-1"
        >
          <Trash2 className="w-4 h-4" />
          <span className="sr-only">Delete member post</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Member Post</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this member's post? This action
            cannot be undone. The post will be immediately removed from all
            church members' feeds.
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
                Delete Post
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
