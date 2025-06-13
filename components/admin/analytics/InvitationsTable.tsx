"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Send,
  Clock,
  Trash,
  CheckCircle,
  XCircle,
  HourglassIcon,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

// Types for invitation data
interface ChurchInvitation {
  id: string;
  inviterName: string;
  inviterEmail: string;
  churchEmail: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  claimedAt?: string;
  claimedByUserId?: string;
  claimedBy?: {
    email?: string;
  };
  inviter: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  type: "church";
}

interface UserInvitation {
  id: string;
  code: string;
  createdAt: string;
  expiresAt?: string;
  userId: string;
  scans: number;
  lastScannedAt?: string;
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  invitees: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    createdAt: string;
  }>;
  type: "user";
}

type Invitation = ChurchInvitation | UserInvitation;

interface InvitationsTableProps {
  invitations: Invitation[];
  onStatusChange: () => void;
  onDelete: () => void;
}

export default function InvitationsTable({
  invitations,
  onStatusChange,
  onDelete,
}: InvitationsTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    action: "expire" | "resend" | "delete";
    invitation: Invitation | null;
    open: boolean;
  }>({
    action: "expire",
    invitation: null,
    open: false,
  });

  if (!invitations.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No invitations found matching the current filters.
      </div>
    );
  }

  // Format invitation name
  const formatName = (invitation: Invitation) => {
    if (invitation.type === "church") {
      const inviter = invitation.inviter;
      return inviter.firstName && inviter.lastName
        ? `${inviter.firstName} ${inviter.lastName}`
        : inviter.email;
    } else {
      const user = invitation.user;
      return user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email;
    }
  };

  // Format invitation email
  const formatEmail = (invitation: Invitation) => {
    if (invitation.type === "church") {
      // Show claimed user email or church email
      return invitation.claimedBy?.email || invitation.churchEmail;
    } else {
      // For user invitations, show invitee information
      if (invitation.invitees.length === 0) {
        return (
          <span className="text-muted-foreground italic">No sign-ups yet</span>
        );
      } else if (invitation.invitees.length === 1) {
        return invitation.invitees[0].email;
      } else {
        const mostRecent = invitation.invitees[0];
        return (
          <div className="space-y-1">
            <div>{mostRecent.email}</div>
            <div className="text-xs text-muted-foreground">
              +{invitation.invitees.length - 1} more
            </div>
          </div>
        );
      }
    }
  };

  // Format invitation status
  const formatStatus = (invitation: Invitation) => {
    if (invitation.type === "church") {
      return (
        <Badge
          variant="outline"
          className={`
            ${invitation.status === "PENDING" && "border-blue-500 bg-blue-50 text-blue-700"}
            ${invitation.status === "CLAIMED" && "border-green-500 bg-green-50 text-green-700"}
            ${invitation.status === "EXPIRED" && "border-gray-500 bg-gray-50 text-gray-700"}
            ${invitation.status === "CANCELLED" && "border-red-500 bg-red-50 text-red-700"}
          `}
        >
          {invitation.status === "PENDING" && (
            <HourglassIcon className="mr-1 h-3 w-3" />
          )}
          {invitation.status === "CLAIMED" && (
            <CheckCircle className="mr-1 h-3 w-3" />
          )}
          {invitation.status === "EXPIRED" && (
            <Clock className="mr-1 h-3 w-3" />
          )}
          {invitation.status === "CANCELLED" && (
            <Ban className="mr-1 h-3 w-3" />
          )}
          {invitation.status.charAt(0) +
            invitation.status.slice(1).toLowerCase()}
        </Badge>
      );
    } else {
      // For user invitations, derive status from expiresAt
      const expired =
        invitation.expiresAt && new Date(invitation.expiresAt) < new Date();
      return (
        <Badge
          variant="outline"
          className={
            expired
              ? "border-gray-500 bg-gray-50 text-gray-700"
              : "border-blue-500 bg-blue-50 text-blue-700"
          }
        >
          {expired ? (
            <>
              <Clock className="mr-1 h-3 w-3" />
              Expired
            </>
          ) : (
            <>
              <HourglassIcon className="mr-1 h-3 w-3" />
              Active
            </>
          )}
        </Badge>
      );
    }
  };

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      <span title={date.toLocaleString()}>
        {formatDistanceToNow(date, { addSuffix: true })}
      </span>
    );
  };

  // Handle actions
  const handleAction = async (
    action: "expire" | "resend" | "delete",
    invitation: Invitation
  ) => {
    setConfirmAction({
      action,
      invitation,
      open: true,
    });
  };

  // Perform action after confirmation
  const performAction = async () => {
    if (!confirmAction.invitation) return;

    const { action, invitation } = confirmAction;
    setLoading(invitation.id);

    try {
      let response;

      switch (action) {
        case "expire":
          response = await fetch(
            `/api/admin/analytics/invitations/${invitation.id}/expire`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: invitation.type }),
            }
          );
          break;
        case "resend":
          response = await fetch(
            `/api/admin/analytics/invitations/${invitation.id}/resend`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: invitation.type }),
            }
          );
          break;
        case "delete":
          response = await fetch(
            `/api/admin/analytics/invitations/${invitation.id}?type=${invitation.type}`,
            {
              method: "DELETE",
            }
          );
          break;
      }

      if (!response?.ok) {
        const data = await response?.json();
        throw new Error(data?.error || `Failed to ${action} invitation`);
      }

      toast.success(
        `Invitation ${action}${action === "delete" ? "d" : "d"} successfully`
      );

      // Refresh data
      if (action === "delete") {
        onDelete();
      } else {
        onStatusChange();
      }
    } catch (error) {
      console.error(`Error ${action}ing invitation:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${action} invitation`
      );
    } finally {
      setLoading(null);
      setConfirmAction({ ...confirmAction, open: false });
    }
  };

  const cancelAction = () => {
    setConfirmAction({ ...confirmAction, open: false });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inviter</TableHead>
              <TableHead>Invitee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">
                  {formatName(invitation)}
                </TableCell>
                <TableCell>{formatEmail(invitation)}</TableCell>
                <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                <TableCell>{formatStatus(invitation)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={loading === invitation.id}
                      >
                        <span className="sr-only">Open menu</span>
                        {loading === invitation.id ? (
                          <HourglassIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {/* Expire option - only for active invitations */}
                      {(invitation.type === "church" &&
                        invitation.status === "PENDING") ||
                      (invitation.type === "user" &&
                        (!invitation.expiresAt ||
                          new Date(invitation.expiresAt) > new Date())) ? (
                        <DropdownMenuItem
                          onClick={() => handleAction("expire", invitation)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          <span>Expire Invitation</span>
                        </DropdownMenuItem>
                      ) : null}

                      {/* Resend option - only for church invitations */}
                      {invitation.type === "church" &&
                        invitation.status === "PENDING" && (
                          <DropdownMenuItem
                            onClick={() => handleAction("resend", invitation)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            <span>Resend Invitation</span>
                          </DropdownMenuItem>
                        )}

                      <DropdownMenuItem
                        onClick={() => handleAction("delete", invitation)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete Invitation</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={confirmAction.open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction.action === "expire" && "Expire Invitation"}
              {confirmAction.action === "resend" && "Resend Invitation"}
              {confirmAction.action === "delete" && "Delete Invitation"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction.action === "expire" && (
                <>
                  Are you sure you want to expire this invitation? This action
                  cannot be undone.
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                    <p className="text-sm">
                      The invitation will no longer be valid. If a user tries to
                      use it, they'll be directed to contact support.
                    </p>
                  </div>
                </>
              )}
              {confirmAction.action === "resend" && (
                <>
                  Are you sure you want to resend this invitation? The recipient
                  will receive a new email.
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
                    <p className="text-sm">
                      The invitation expiration will be reset to 7 days from
                      now.
                    </p>
                  </div>
                </>
              )}
              {confirmAction.action === "delete" && (
                <>
                  Are you sure you want to delete this invitation? This action
                  cannot be undone.
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                    <p className="text-sm">
                      Deleting the invitation will remove it permanently from
                      the database.
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performAction}>
              {confirmAction.action === "expire" && "Expire"}
              {confirmAction.action === "resend" && "Resend"}
              {confirmAction.action === "delete" && "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
