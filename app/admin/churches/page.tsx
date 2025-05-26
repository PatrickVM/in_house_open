import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";

export default async function ChurchesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Get approved churches directly from database
  const churches = await db.church.findMany({
    where: {
      applicationStatus: "APPROVED",
    },
    include: {
      leadContact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">
            Church Management
          </h1>
          <p className="text-gray-400 mt-2">
            Manage approved churches and their activities
          </p>
        </div>
        <div className="text-sm text-gray-400">
          Total Churches: {churches.length}
        </div>
      </div>

      {/* Churches Grid */}
      {churches.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No Churches Found
            </h3>
            <p className="text-gray-500 text-center">
              No approved churches are currently in the system.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {churches.map((church) => (
            <Card
              key={church.id}
              className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-gray-100 line-clamp-2">
                    {church.name}
                  </CardTitle>
                  {church.website && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-gray-400 hover:text-gray-200"
                    >
                      <a
                        href={church.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  Pastor: {church.leadPastorName}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Location */}
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <div>{church.address}</div>
                    <div>
                      {church.city}, {church.state} {church.zipCode}
                    </div>
                  </div>
                </div>

                {/* Lead Contact */}
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div className="text-sm text-gray-300">
                    {church.leadContact.firstName && church.leadContact.lastName
                      ? `${church.leadContact.firstName} ${church.leadContact.lastName}`
                      : church.leadContact.email}
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-300">
                    Approved {new Date(church.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Coordinates Badge */}
                {church.latitude && church.longitude && (
                  <Badge
                    variant="secondary"
                    className="bg-gray-700 text-gray-300"
                  >
                    Coordinates Set
                  </Badge>
                )}

                {/* Actions */}
                <div className="pt-2">
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href={`/admin/churches/${church.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
