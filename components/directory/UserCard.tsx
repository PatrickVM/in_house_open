"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Church } from "lucide-react";
import PingButton from "@/components/ping/PingButton";
import ContactInfo from "@/components/ping/ContactInfo";
import { usePingStatus } from "@/hooks/usePingStatus";

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  bio: string | null;
  services: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  verifiedAt: Date | null;
}

interface UserCardProps {
  user: User;
  currentUserId: string;
  churchName: string;
}

export default function UserCard({ user, currentUserId, churchName }: UserCardProps) {
  const {
    pingStatus,
    canSendPing,
    canViewContact,
    relationshipStatus,
    loading,
    refreshPingStatus,
  } = usePingStatus(user.id);

  const isCurrentUser = user.id === currentUserId;

  return (
    <Card key={user.id}>
      <CardHeader className="pb-3">
        <CardTitle>
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email}
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Church className="w-3 h-3" />
          {churchName} Member
          {user.verifiedAt && (
            <span className="text-xs">
              • Verified{" "}
              {new Date(user.verifiedAt).toLocaleDateString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.bio && (
          <p className="text-sm text-muted-foreground">{user.bio}</p>
        )}

        {/* Contact Info - Only shown if user is current user or ping is accepted */}
        {(isCurrentUser || canViewContact) && (user.phone || user.email) && (
          <ContactInfo phone={user.phone} email={user.email} />
        )}

        {/* Ping Button - Only shown for other users */}
        {!isCurrentUser && !loading && (
          <PingButton
            targetUserId={user.id}
            currentUserId={currentUserId}
            pingStatus={pingStatus}
            canSendPing={canSendPing}
            canViewContact={canViewContact}
            relationshipStatus={relationshipStatus}
            onPingUpdate={refreshPingStatus}
          />
        )}

        {user.services && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              SERVICES & SKILLS
            </p>
            <div className="flex flex-wrap gap-1">
              {user.services
                .split(",")
                .map((service: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs"
                  >
                    {service.trim()}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}