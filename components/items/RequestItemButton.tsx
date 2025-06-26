"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Send } from "lucide-react";

interface RequestItemButtonProps {
  item: {
    id: string;
    title: string;
    memberRequests?: Array<{
      id: string;
      status: string;
      user: {
        id: string;
        firstName: string | null;
        lastName: string | null;
      };
    }>;
  };
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

export function RequestItemButton({
  item,
  onSuccess,
  disabled = false,
  className,
}: RequestItemButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [memberNotes, setMemberNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleRequest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/items/${item.id}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberNotes: memberNotes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to request item");
      }

      toast({
        title: "Request Submitted",
        description: `Your request for "${item.title}" has been submitted and will expire in 7 days.`,
      });

      setDialogOpen(false);
      setMemberNotes("");
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Request Failed",
        description:
          error instanceof Error ? error.message : "Failed to request item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveRequest =
    item.memberRequests && item.memberRequests.length > 0;

  if (disabled || hasActiveRequest) {
    const requesterName = hasActiveRequest
      ? `${item.memberRequests![0].user.firstName} ${item.memberRequests![0].user.lastName}`
      : "Another member";

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" disabled className={className}>
              Already Requested
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This item has been requested by {requesterName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className={className}>
                <Send className="w-4 h-4 mr-2" />
                Request Item
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p>Request this item</p>
              <div className="flex items-center gap-1 text-xs mt-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Expires after 7 days</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Request Item
            </DialogTitle>
            <DialogDescription>
              You're requesting "{item.title}". Your request will expire after 7
              days if not collected.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="memberNotes">
                Optional Message
                <span className="text-xs text-muted-foreground ml-1">
                  (for church leaders)
                </span>
              </Label>
              <Textarea
                id="memberNotes"
                placeholder="Add any notes or questions about this item..."
                value={memberNotes}
                onChange={(e) => setMemberNotes(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <div className="text-xs text-muted-foreground text-right">
                {memberNotes.length}/500
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">7-Day Expiration</p>
                  <p>
                    Your request will automatically expire after 7 days. Please
                    coordinate pickup with your church leaders promptly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleRequest} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
