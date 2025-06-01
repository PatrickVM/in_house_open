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
} from "lucide-react";

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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card shadow-md border-r border-border">
        <div className="p-6">
          <h1 className="text-xl font-bold text-foreground">Church Portal</h1>
          <p className="text-sm text-muted-foreground">InHouse Network</p>
        </div>

        <nav className="mt-6">
          <ChurchNavLink href="/church/dashboard" icon={LayoutDashboard}>
            Dashboard
          </ChurchNavLink>
          <ChurchNavLink href="/church/dashboard/items" icon={Package}>
            My Items
          </ChurchNavLink>
          <ChurchNavLink href="/church/dashboard/members" icon={Users}>
            Members
          </ChurchNavLink>
          <ChurchNavLink href="/church/dashboard/area-items" icon={MapPin}>
            Area Items
          </ChurchNavLink>
          <ChurchNavLink href="/church/dashboard/messages" icon={MessageSquare}>
            Daily Messages
          </ChurchNavLink>
          <ChurchNavLink href="/church/dashboard/profile" icon={Settings}>
            Church Profile
          </ChurchNavLink>
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-border">
          <div className="flex items-center">
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
            className="mt-4 block text-sm text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to Main Site
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card shadow-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
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
      </div>
    </div>
  );
}

// Client component for navigation links
function ChurchNavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-6 py-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Icon className="w-5 h-5 mr-3" />
      {children}
    </Link>
  );
}
