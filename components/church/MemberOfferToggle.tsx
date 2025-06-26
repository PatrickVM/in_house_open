"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users, Settings, AlertTriangle, Info } from "lucide-react";

interface MemberOfferToggleProps {
  itemId: string;
  itemTitle: string;
  offerToMembers: boolean;
  memberDescription: string | null;
  activeRequests?: Array<{
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
    status: string;
  }>;
  className?: string;
}

export function MemberOfferToggle({
  itemId,
  itemTitle,
  offerToMembers,
  memberDescription,
  activeRequests = [],
  className,
}: MemberOfferToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempDescription, setTempDescription] = useState(
    memberDescription || ""
  );
  const [tempOfferToMembers, setTempOfferToMembers] = useState(offerToMembers);
  const { toast } = useToast();
  const router = useRouter();

  const hasActiveRequests = activeRequests.length > 0;

  const handleToggle = async (enabled: boolean) => {
    // If turning off and there are active requests, show warning dialog
    if (!enabled && hasActiveRequests) {
      setTempOfferToMembers(false);
      setDialogOpen(true);
      return;
    }

    // If turning on, open dialog to set description
    if (enabled) {
      setTempOfferToMembers(true);
      setDialogOpen(true);
      return;
    }

    // If turning off with no active requests, update immediately
    await updateSettings(false, null);
  };

  const updateSettings = async (
    enabled: boolean,
    description: string | null
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/church/items/${itemId}/member-settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            offerToMembers: enabled,
            memberDescription: description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update settings");
      }

      // Handle warnings (when disabling with active requests)
      if (data.warning) {
        toast({
          title: "Settings Updated with Warning",
          description: `${data.message}. ${data.warning.activeRequests} active request(s) will remain visible to members.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Settings Updated",
          description: `Member offering ${enabled ? "enabled" : "disabled"} for "${itemTitle}"`,
        });
      }

      // Refresh the page to sync with server state
      router.refresh();

      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    await updateSettings(tempOfferToMembers, tempDescription.trim() || null);
  };

  const handleCancel = () => {
    setTempOfferToMembers(offerToMembers);
    setTempDescription(memberDescription || "");
    setDialogOpen(false);
  };

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <CardTitle className="text-sm">Member Offering</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Allow church members to request this item</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              checked={offerToMembers}
              onCheckedChange={handleToggle}
              disabled={isLoading}
            />
          </div>
          <CardDescription className="text-xs">
            Share this item with verified church members
          </CardDescription>
        </CardHeader>

        {offerToMembers && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {memberDescription && (
                <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="font-medium text-blue-800">
                    Member Description:
                  </p>
                  <p className="text-blue-700">{memberDescription}</p>
                </div>
              )}

              {hasActiveRequests && (
                <div className="text-xs bg-green-50 border border-green-200 rounded p-2">
                  <p className="font-medium text-green-800">
                    Active Requests ({activeRequests.length}):
                  </p>
                  <div className="mt-1 space-y-1">
                    {activeRequests.map((request, index) => (
                      <div key={index} className="text-green-700">
                        • {request.user.firstName} {request.user.lastName} (
                        {request.status.toLowerCase()})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="w-full"
              >
                <Settings className="w-3 h-3 mr-2" />
                Edit Settings
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Member Offering Settings
            </DialogTitle>
            <DialogDescription>
              Configure how this item appears to church members
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={tempOfferToMembers}
                onCheckedChange={setTempOfferToMembers}
                disabled={isLoading}
              />
              <Label htmlFor="offer-toggle" className="text-sm">
                Offer to members
              </Label>
            </div>

            {tempOfferToMembers && (
              <div className="space-y-2">
                <Label htmlFor="member-description" className="text-sm">
                  Member Description
                  <span className="text-xs text-muted-foreground ml-1">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="member-description"
                  placeholder="Add a description specifically for church members..."
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {tempDescription.length}/500
                </div>
                <p className="text-xs text-muted-foreground">
                  This description will be shown to members alongside the main
                  item description
                </p>
              </div>
            )}

            {/* Warning when trying to disable with active requests */}
            {!tempOfferToMembers && hasActiveRequests && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Warning: Active Requests</p>
                    <p>
                      Disabling member offering will prevent new requests, but
                      existing requests will remain active.
                    </p>
                    <div className="mt-2">
                      <p className="font-medium">Current requests:</p>
                      {activeRequests.map((request, index) => (
                        <p key={index} className="text-xs">
                          • {request.user.firstName} {request.user.lastName} -{" "}
                          {request.user.email}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
