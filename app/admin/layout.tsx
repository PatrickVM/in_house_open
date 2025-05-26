import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  Package,
} from "lucide-react";

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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card shadow-md border-r border-border">
        <div className="p-6">
          <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-sm text-muted-foreground">InHouse Network</p>
        </div>

        <nav className="mt-6">
          <AdminNavLink href="/admin" icon={LayoutDashboard}>
            Dashboard
          </AdminNavLink>
          <AdminNavLink href="/admin/applications" icon={FileText}>
            Applications
          </AdminNavLink>
          <AdminNavLink href="/admin/churches" icon={Building2}>
            Churches
          </AdminNavLink>
          <AdminNavLink href="/admin/users" icon={Users}>
            Users
          </AdminNavLink>
          <AdminNavLink href="/admin/items" icon={Package}>
            Items
          </AdminNavLink>
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-border">
          <div className="flex items-center">
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
      </div>
    </div>
  );
}

// Client component for navigation links
function AdminNavLink({
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
