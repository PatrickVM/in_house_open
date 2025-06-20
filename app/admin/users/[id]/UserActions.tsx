"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { UserRole } from "@prisma/client";
import { Shield, ShieldOff, UserCog } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  firstName?: string | null;
  lastName?: string | null;
}

interface UserActionsProps {
  user: User;
}

export default function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);

  const handleRoleChange = async () => {
    if (selectedRole === user.role) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "changeRole",
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role. Please try again.");
      setSelectedRole(user.role); // Reset to original role
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: user.isActive ? "deactivate" : "activate",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  return (
    <div className="space-y-4">
      {/* Role Management */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserCog className="w-4 h-4" />
          <span className="text-sm font-medium">Change Role</span>
        </div>
        <Select
          value={selectedRole}
          onValueChange={(value: UserRole) => setSelectedRole(value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="CHURCH">Church</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>

        {selectedRole !== user.role && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={isLoading}
              >
                Update Role to {selectedRole}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Change User Role</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to change {getUserDisplayName()}'s role
                  from{" "}
                  <Badge variant="outline" className="mx-1">
                    {user.role}
                  </Badge>
                  to
                  <Badge variant="outline" className="mx-1">
                    {selectedRole}
                  </Badge>
                  ? This action will immediately change their access
                  permissions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedRole(user.role)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleRoleChange}>
                  Change Role
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Account Status Toggle */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center gap-2">
          {user.isActive ? (
            <ShieldOff className="w-4 h-4 text-red-500" />
          ) : (
            <Shield className="w-4 h-4 text-green-500" />
          )}
          <span className="text-sm font-medium">Account Status</span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant={user.isActive ? "destructive" : "default"}
              size="sm"
              className="w-full"
              disabled={isLoading}
            >
              {user.isActive ? "Deactivate Account" : "Activate Account"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {user.isActive ? "Deactivate" : "Activate"} User Account
              </AlertDialogTitle>
              <AlertDialogDescription>
                {user.isActive ? (
                  <>
                    Are you sure you want to deactivate {getUserDisplayName()}'s
                    account? This will prevent them from logging in and
                    accessing the platform. You can reactivate their account at
                    any time.
                  </>
                ) : (
                  <>
                    Are you sure you want to activate {getUserDisplayName()}'s
                    account? This will allow them to log in and access the
                    platform again.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleStatusToggle}
                className={user.isActive ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {user.isActive ? "Deactivate" : "Activate"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Warning for Admin Role Changes */}
      {selectedRole === "ADMIN" && user.role !== "ADMIN" && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Warning:</strong> Granting admin access will give this user
            full administrative privileges including the ability to manage other
            users and approve church applications.
          </p>
        </div>
      )}

      {/* Info for Church Role */}
      {selectedRole === "CHURCH" && user.role !== "CHURCH" && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Church role is typically assigned
            automatically when a church application is approved. Manual
            assignment should be used carefully.
          </p>
        </div>
      )}
    </div>
  );
}
