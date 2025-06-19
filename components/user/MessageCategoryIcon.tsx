import React from "react";
import { Badge } from "@/components/ui/badge";
import { getUserMessageCategoryInfo } from "@/lib/messages";

interface MessageCategoryIconProps {
  category: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function MessageCategoryIcon({
  category,
  showLabel = true,
  size = "md",
}: MessageCategoryIconProps) {
  const categoryInfo = getUserMessageCategoryInfo(category);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <Badge
      variant="outline"
      className={`${categoryInfo.color} ${sizeClasses[size]} inline-flex items-center gap-1`}
    >
      <span role="img" aria-label={categoryInfo.label}>
        {categoryInfo.icon}
      </span>
      {showLabel && <span>{categoryInfo.label}</span>}
    </Badge>
  );
}
