import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Mail, Building2, Users } from "lucide-react";
import { db } from "@/lib/db";

interface SearchParams {
  page?: string;
  role?: string;
  status?: string;
}

interface UsersPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const roleFilter = params.role;
  const statusFilter = params.status;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Build where clause for filtering
  const whereClause: any = {};
  if (roleFilter && roleFilter !== "all") {
    whereClause.role = roleFilter;
  }
  if (statusFilter && statusFilter !== "all") {
    whereClause.isActive = statusFilter === "active";
  }

  // Get users with pagination and filtering
  const [users, totalUsers] = await Promise.all([
    db.user.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    }),
    db.user.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  // Calculate profile completion for each user
  const usersWithCompletion = users.map((user) => {
    const profileFields = [
      user.firstName,
      user.lastName,
      user.bio,
      user.churchName,
      user.services,
      user.address,
      user.phone,
    ];
    const filledFields = profileFields.filter(
      (field) => field && field.trim() !== ""
    ).length;
    const completionPercentage = Math.round(
      (filledFields / profileFields.length) * 100
    );

    return {
      ...user,
      completionPercentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalUsers} total users
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Role:</span>
              <div className="flex gap-2">
                <Link
                  href={`/admin/users?page=1${
                    statusFilter ? `&status=${statusFilter}` : ""
                  }`}
                >
                  <Button
                    variant={
                      !roleFilter || roleFilter === "all"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                  >
                    All
                  </Button>
                </Link>
                <Link
                  href={`/admin/users?page=1&role=USER${
                    statusFilter ? `&status=${statusFilter}` : ""
                  }`}
                >
                  <Button
                    variant={roleFilter === "USER" ? "default" : "outline"}
                    size="sm"
                  >
                    Users
                  </Button>
                </Link>
                <Link
                  href={`/admin/users?page=1&role=CHURCH${
                    statusFilter ? `&status=${statusFilter}` : ""
                  }`}
                >
                  <Button
                    variant={roleFilter === "CHURCH" ? "default" : "outline"}
                    size="sm"
                  >
                    Churches
                  </Button>
                </Link>
                <Link
                  href={`/admin/users?page=1&role=ADMIN${
                    statusFilter ? `&status=${statusFilter}` : ""
                  }`}
                >
                  <Button
                    variant={roleFilter === "ADMIN" ? "default" : "outline"}
                    size="sm"
                  >
                    Admins
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex gap-2">
                <Link
                  href={`/admin/users?page=1${
                    roleFilter ? `&role=${roleFilter}` : ""
                  }`}
                >
                  <Button
                    variant={
                      !statusFilter || statusFilter === "all"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                  >
                    All
                  </Button>
                </Link>
                <Link
                  href={`/admin/users?page=1&status=active${
                    roleFilter ? `&role=${roleFilter}` : ""
                  }`}
                >
                  <Button
                    variant={statusFilter === "active" ? "default" : "outline"}
                    size="sm"
                  >
                    Active
                  </Button>
                </Link>
                <Link
                  href={`/admin/users?page=1&status=inactive${
                    roleFilter ? `&role=${roleFilter}` : ""
                  }`}
                >
                  <Button
                    variant={
                      statusFilter === "inactive" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    Inactive
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {usersWithCompletion.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </h3>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "ADMIN"
                            ? "text-purple-600 border-purple-200 bg-purple-50"
                            : user.role === "CHURCH"
                            ? "text-blue-600 border-blue-200 bg-blue-50"
                            : "text-gray-600 border-gray-200 bg-gray-50"
                        }
                      >
                        {user.role}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          user.isActive
                            ? "text-green-600 border-green-200 bg-green-50"
                            : "text-red-600 border-red-200 bg-red-50"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      {user.churchName && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {user.churchName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium text-foreground">
                      Profile: {user.completionPercentage}%
                    </div>
                    <div className="w-24 h-2 bg-muted rounded-full">
                      <div
                        className="h-2 bg-primary rounded-full transition-all"
                        style={{ width: `${user.completionPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.role === "CHURCH"
                        ? "Church leader"
                        : "Community member"}
                    </div>
                  </div>
                  <Link href={`/admin/users/${user.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {offset + 1}-{Math.min(offset + limit, totalUsers)} of{" "}
                {totalUsers} users
              </div>
              <div className="flex items-center space-x-2">
                {page > 1 && (
                  <Link
                    href={`/admin/users?page=${page - 1}${
                      roleFilter ? `&role=${roleFilter}` : ""
                    }${statusFilter ? `&status=${statusFilter}` : ""}`}
                  >
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                  </Link>
                )}
                <span className="text-sm font-medium">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/admin/users?page=${page + 1}${
                      roleFilter ? `&role=${roleFilter}` : ""
                    }${statusFilter ? `&status=${statusFilter}` : ""}`}
                  >
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {usersWithCompletion.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No users found
            </h3>
            <p className="text-muted-foreground text-center">
              No users match the current filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
