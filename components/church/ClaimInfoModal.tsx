"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, User, Mail, Phone, MapPin } from "lucide-react";
import CompleteItemButton from "@/components/church/CompleteItemButton";
import UnclaimItemButton from "@/components/church/UnclaimItemButton";

interface ClaimInfoModalProps {
  item: {
    id: string;
    title: string;
    claimedAt?: Date | null;
    claimer?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      phone: string | null;
    } | null;
    claimingChurch?: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      website: string | null;
      leadPastorName: string;
    } | null;
  };
}

export function ClaimInfoModal({ item }: ClaimInfoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!item.claimer || !item.claimingChurch) {
    return null;
  }

  return (
    <>
      <Badge
        variant="outline"
        className="text-purple-600 border-purple-200 cursor-pointer hover:bg-purple-50"
        onClick={() => setIsOpen(true)}
      >
        <Building2 className="w-3 h-3 mr-1" />
        {item.claimingChurch.name}
      </Badge>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Claimed by: {item.claimingChurch.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Lead Contact */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Lead Contact
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>
                    {item.claimer.firstName} {item.claimer.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <a
                    href={`mailto:${item.claimer.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {item.claimer.email}
                  </a>
                </div>
                {item.claimer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a
                      href={`tel:${item.claimer.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.claimer.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Church Details */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Church Details
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {item.claimingChurch.city}, {item.claimingChurch.state}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    Pastor: {item.claimingChurch.leadPastorName}
                  </span>
                </div>
                {item.claimingChurch.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">🌐</span>
                    <a
                      href={item.claimingChurch.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Claimed Date */}
            {item.claimedAt && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">
                  Claimed on {item.claimedAt.toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t pt-4 flex gap-2">
              <CompleteItemButton
                itemId={item.id}
                itemTitle={item.title}
                claimingChurchName={item.claimingChurch.name}
              />
              <UnclaimItemButton
                itemId={item.id}
                itemTitle={item.title}
                claimingChurchName={item.claimingChurch.name}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
