import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Eye, Calendar, MapPin, User } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams.status;

  // Build where clause based on filter
  const whereClause =
    statusFilter && statusFilter !== "all"
      ? { applicationStatus: statusFilter as any }
      : {};

  // Fetch applications with lead contact information
  const applications = await db.church.findMany({
    where: whereClause,
    include: {
      leadContact: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: [
      { applicationStatus: "asc" }, // PENDING first
      { createdAt: "desc" },
    ],
  });

  // Get counts for filter badges
  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    db.church.count({ where: { applicationStatus: "PENDING" } }),
    db.church.count({ where: { applicationStatus: "APPROVED" } }),
    db.church.count({ where: { applicationStatus: "REJECTED" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Church Applications</h1>
          <p className="text-gray-300">Review and manage church applications</p>
        </div>
        <div className="text-sm text-gray-300">
          {applications.length} applications
        </div>
      </div>

      {/* Status Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-white">Filter by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/applications">
              <Button
                variant={
                  !statusFilter || statusFilter === "all"
                    ? "default"
                    : "outline"
                }
                size="sm"
              >
                All Applications ({applications.length})
              </Button>
            </Link>
            <Link href="/admin/applications?status=PENDING">
              <Button
                variant={statusFilter === "PENDING" ? "default" : "outline"}
                size="sm"
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                Pending ({pendingCount})
              </Button>
            </Link>
            <Link href="/admin/applications?status=APPROVED">
              <Button
                variant={statusFilter === "APPROVED" ? "default" : "outline"}
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                Approved ({approvedCount})
              </Button>
            </Link>
            <Link href="/admin/applications?status=REJECTED">
              <Button
                variant={statusFilter === "REJECTED" ? "default" : "outline"}
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Rejected ({rejectedCount})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="grid gap-4">
        {applications.length > 0 ? (
          applications.map((application) => (
            <Card
              key={application.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {application.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={
                          application.applicationStatus === "PENDING"
                            ? "text-amber-600 border-amber-200 bg-amber-50"
                            : application.applicationStatus === "APPROVED"
                            ? "text-green-600 border-green-200 bg-green-50"
                            : "text-red-600 border-red-200 bg-red-50"
                        }
                      >
                        {application.applicationStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>Pastor {application.leadPastorName}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>
                          {application.city}, {application.state}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Applied {application.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-300">
                      <p>
                        <strong>Contact:</strong>{" "}
                        {application.leadContact.firstName}{" "}
                        {application.leadContact.lastName}
                      </p>
                      <p>
                        <strong>Email:</strong> {application.leadContact.email}
                      </p>
                      {application.leadContact.phone && (
                        <p>
                          <strong>Phone:</strong>{" "}
                          {application.leadContact.phone}
                        </p>
                      )}
                    </div>

                    {/* TODO: Add rejectionReason display after Prisma client regeneration */}
                  </div>

                  <div className="ml-6">
                    <Link href={`/admin/applications/${application.id}`}>
                      <Button size="sm" className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No applications found
              </h3>
              <p className="text-gray-300">
                {statusFilter && statusFilter !== "all"
                  ? `No applications with status "${statusFilter}"`
                  : "No church applications have been submitted yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
