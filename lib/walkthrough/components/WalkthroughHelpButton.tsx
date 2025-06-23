"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useWalkthrough } from "../useWalkthrough";

export function WalkthroughHelpButton() {
  const { data: session } = useSession();
  const { restartWalkthrough, isActive } = useWalkthrough();

  // Only show for authenticated users
  if (!session?.user || isActive) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={restartWalkthrough}
      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
      title="Restart walkthrough"
    >
      <HelpCircle className="h-4 w-4 mr-1" />
      Help
    </Button>
  );
}
