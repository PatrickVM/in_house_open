import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, User, Calendar, Package } from "lucide-react";

interface ChurchProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ChurchProfilePage({
  params,
}: ChurchProfilePageProps) {
  const { id } = await params;

  // Get church details with items
  const church = await db.church.findUnique({
    where: { id },
    include: {
      leadContact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      items: {
        where: {
          moderationStatus: "APPROVED",
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!church || church.applicationStatus !== "APPROVED") {
    notFound();
  }

  const availableItems = church.items.filter(
    (item) => item.status === "AVAILABLE"
  );
  const claimedItems = church.items.filter((item) => item.status === "CLAIMED");
  const completedItems = church.items.filter(
    (item) => item.status === "COMPLETED"
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Church Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{church.name}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Led by {church.leadPastorName}
                </p>
              </div>
              <Badge variant="default">Approved Church</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location */}
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div>{church.address}</div>
                <div>
                  {church.city}, {church.state} {church.zipCode}
                </div>
              </div>
            </div>

            {/* Website */}
            {church.website && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <a
                  href={church.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {church.website}
                </a>
              </div>
            )}

            {/* Lead Contact */}
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div className="text-sm">
                Contact: {church.leadContact.firstName}{" "}
                {church.leadContact.lastName}
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                Member since {new Date(church.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Items Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{church.items.length}</div>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {availableItems.length}
              </div>
              <p className="text-xs text-muted-foreground">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-600">
                {claimedItems.length}
              </div>
              <p className="text-xs text-muted-foreground">Claimed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {completedItems.length}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Items */}
        {availableItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Available Items ({availableItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableItems.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <Badge variant="default" className="text-xs">
                        {item.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {item.category}
                    </p>

                    {item.description && (
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                        {item.description}
                      </p>
                    )}

                    <div className="text-xs text-gray-500">
                      Listed {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Items Message */}
        {church.items.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Items Available</h3>
              <p className="text-gray-600">
                This church hasn't posted any items yet. Check back later!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
