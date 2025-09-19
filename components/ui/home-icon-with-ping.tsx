"use client";

import { HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePingCount } from "@/hooks/usePingCount";

interface HomeIconWithPingProps {
  className?: string;
}

export function HomeIconWithPing({ className }: HomeIconWithPingProps) {
  const { hasNotifications, totalUnread } = usePingCount();

  return (
    <div className="relative home-icon-with-ping" data-walkthrough="home-icon">
      <HomeIcon 
        className={cn(
          className,
          hasNotifications && [
            "ring-2 ring-red-200/60 ring-offset-2 ring-offset-background",
            "transition-all duration-300 ease-in-out",
            "shadow-sm shadow-red-200/40"
          ]
        )}
      />
      {hasNotifications && totalUnread > 0 && (
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-400/80 border border-background rounded-full flex items-center justify-center">
          <span className="text-[8px] font-medium text-white leading-none">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        </span>
      )}
    </div>
  );
}