import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  LayoutDashboard,
  Package,
  Building2,
  MessageSquare,
  MapPin,
  Settings,
  Users,
  Send,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNavLink } from "@/components/ui/sidebar-nav-link";

interface ChurchLayoutProps {
  children: React.ReactNode;
}

export default async function ChurchLayout({ children }: ChurchLayoutProps) {
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated or not a church user
  if (!session?.user || session.user.role !== "CHURCH") {
    redirect("/login");
  }

  // Get the church associated with this user for display
  const church = await db.church.findFirst({
    where: {
      leadContactId: session.user.id,
      applicationStatus: "APPROVED",
    },
  });

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/church/dashboard",
      icon: "LayoutDashboard" as const,
    },
    {
      title: "My Items",
      url: "/church/dashboard/items",
      icon: "Package" as const,
    },
    {
      title: "Members",
      url: "/church/dashboard/members",
      icon: "Users" as const,
    },
    {
      title: "Members Posts",
      url: "/church/dashboard/members-posts",
      icon: "FileText" as const,
    },
    {
      title: "Invitations",
      url: "/church/dashboard/invitations",
      icon: "Send" as const,
    },
    {
      title: "Area Items",
      url: "/church/dashboard/area-items",
      icon: "MapPin" as const,
    },
    {
      title: "Daily Messages",
      url: "/church/dashboard/messages",
      icon: "MessageSquare" as const,
    },
    {
      title: "Church Profile",
      url: "/church/dashboard/profile",
      icon: "Settings" as const,
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-2">
            <h1 className="text-xl font-bold text-foreground">Church Portal</h1>
            <p className="text-sm text-muted-foreground">InHouse Network</p>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarNavLink href={item.url} icon={item.icon}>
                      {item.title}
                    </SidebarNavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="p-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">
                  {church?.name || "Church"}
                </p>
                <p className="text-xs text-muted-foreground">Church Admin</p>
              </div>
            </div>
            <Link
              href="/"
              className="block text-sm text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to Main Site
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-foreground">
              Church Dashboard
            </h2>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
