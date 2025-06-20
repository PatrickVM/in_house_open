import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Building2,
} from "lucide-react";
import { ApplicationActions } from "@/components/admin/ApplicationActions";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const application = await db.church.findUnique({
    where: { id },
    include: {
      leadContact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
          role: true,
        },
      },
    },
  });

  if (!application) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/applications">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {application.name}
          </h1>
          <p className="text-gray-600">Church Application Review</p>
        </div>
        <div className="ml-auto">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Application Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Church Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Church Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Church Name
                  </label>
                  <p className="text-lg font-semibold">{application.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Lead Pastor
                  </label>
                  <p className="text-lg font-semibold">
                    {application.leadPastorName}
                  </p>
                </div>
              </div>

              {application.website && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Website
                  </label>
                  <div className="flex items-center mt-1">
                    <Globe className="w-4 h-4 mr-2 text-gray-400" />
                    <a
                      href={application.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {application.website}
                    </a>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Application Date
                </label>
                <div className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{application.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Address
                </label>
                <p className="text-lg">{application.address}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    City
                  </label>
                  <p className="text-lg">{application.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    State
                  </label>
                  <p className="text-lg">{application.state}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    ZIP Code
                  </label>
                  <p className="text-lg">{application.zipCode}</p>
                </div>
              </div>

              {application.latitude && application.longitude && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>Coordinates Set:</strong> {application.latitude},{" "}
                    {application.longitude}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Lead Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Name
                  </label>
                  <p className="text-lg font-semibold">
                    {application.leadContact.firstName}{" "}
                    {application.leadContact.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    User Role
                  </label>
                  <Badge variant="outline">
                    {application.leadContact.role}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Email
                </label>
                <div className="flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <a
                    href={`mailto:${application.leadContact.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {application.leadContact.email}
                  </a>
                </div>
              </div>

              {application.leadContact.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Phone
                  </label>
                  <div className="flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <a
                      href={`tel:${application.leadContact.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {application.leadContact.phone}
                    </a>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">
                  User Since
                </label>
                <p className="text-sm text-gray-600">
                  {application.leadContact.createdAt.toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Application Actions */}
          {application.applicationStatus === "PENDING" && (
            <ApplicationActions
              applicationId={application.id}
              currentLatitude={application.latitude}
              currentLongitude={application.longitude}
            />
          )}

          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Status</span>
                  <Badge
                    variant="outline"
                    className={
                      application.applicationStatus === "PENDING"
                        ? "text-amber-600 border-amber-200"
                        : application.applicationStatus === "APPROVED"
                          ? "text-green-600 border-green-200"
                          : "text-red-600 border-red-200"
                    }
                  >
                    {application.applicationStatus}
                  </Badge>
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {application.createdAt.toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {application.updatedAt.toLocaleDateString()}
                  </p>
                </div>

                {application.applicationStatus === "APPROVED" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      This church has been approved and the lead contact should
                      have CHURCH role access.
                    </p>
                  </div>
                )}

                {application.applicationStatus === "REJECTED" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      This application has been rejected. The lead contact has
                      been notified.
                    </p>
                    {/* TODO: Display rejection reason when Prisma client is updated */}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/admin/users/${application.leadContact.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Lead Contact Profile
                </Button>
              </Link>
              <Link href="/admin/applications">
                <Button variant="outline" size="sm" className="w-full">
                  Back to All Applications
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
