import { authOptions } from "@/auth";
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
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated and has admin role
  const session = (await getServerSession(authOptions as any)) as any;

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/"); // Redirect non-admin users to home
  }

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: "LayoutDashboard" as const,
    },
    {
      title: "Applications",
      url: "/admin/applications",
      icon: "FileText" as const,
    },
    {
      title: "Churches",
      url: "/admin/churches",
      icon: "Building2" as const,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: "Users" as const,
    },
    {
      title: "Platform Messages",
      url: "/admin/messages",
      icon: "MessageSquare" as const,
    },
    {
      title: "Items",
      url: "/admin/items",
      icon: "Package" as const,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: "BarChart" as const,
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-2">
            <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">InHouse Network</p>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
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
                <span className="text-primary-foreground text-sm font-medium">
                  {session.user.email?.[0].toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">
                  {session.user.email}
                </p>
                <p className="text-xs text-muted-foreground">Administrator</p>
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
              Admin Dashboard
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
