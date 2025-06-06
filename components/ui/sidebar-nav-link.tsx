"use client";

import Link from "next/link";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Building2,
  MessageSquare,
  MapPin,
  Settings,
  Users,
  FileText,
} from "lucide-react";

// Icon mapping for dynamic rendering
const iconMap = {
  LayoutDashboard,
  Package,
  Building2,
  MessageSquare,
  MapPin,
  Settings,
  Users,
  FileText,
} as const;

type IconName = keyof typeof iconMap;

interface SidebarNavLinkProps {
  href: string;
  icon: IconName;
  children: React.ReactNode;
}

export function SidebarNavLink({ href, icon, children }: SidebarNavLinkProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const IconComponent = iconMap[icon];

  const handleClick = () => {
    // Close mobile sidebar when navigating
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenuButton asChild>
      <Link href={href} onClick={handleClick}>
        <IconComponent className="w-5 h-5" />
        <span>{children}</span>
      </Link>
    </SidebarMenuButton>
  );
}
