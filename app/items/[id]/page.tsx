import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Package,
  Building2,
  Phone,
  Mail,
  Globe,
  User,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import ClaimButton from "@/components/items/ClaimButton";

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const session = await getServerSession(authOptions);

  // Only allow logged-in church users
  // TODO: Enhance with public view for non-church users
  if (!session?.user || session.user.role !== "CHURCH") {
    redirect("/login");
  }

  const { id } = await params;

  // Get current user's church
  const currentChurch = await db.church.findFirst({
    where: {
      leadContactId: session.user.id,
      applicationStatus: "APPROVED",
    },
  });

  if (!currentChurch) {
    redirect("/church/dashboard");
  }

  // Get item with all related information
  const item = await db.item.findUnique({
    where: { id },
    include: {
      church: {
        include: {
          leadContact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      claimer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!item) {
    notFound();
  }

  // Only show approved items
  if (item.moderationStatus !== "APPROVED") {
    notFound();
  }

  // Check if current church is the claimer
  const isClaimedByCurrentChurch =
    item.claimer?.id === currentChurch.leadContactId;

  // Check if current church owns this item
  const isOwnItem = item.churchId === currentChurch.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/map">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Item Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={
                        item.status === "AVAILABLE"
                          ? "text-green-600 border-green-200 bg-green-50"
                          : item.status === "CLAIMED"
                          ? "text-amber-600 border-amber-200 bg-amber-50"
                          : "text-blue-600 border-blue-200 bg-blue-50"
                      }
                    >
                      {item.status}
                    </Badge>
                    <Badge variant="outline" className="text-gray-600">
                      {item.category}
                    </Badge>
                  </div>
                </div>

                {/* Claim/Unclaim Button */}
                {!isOwnItem && (
                  <ClaimButton
                    itemId={item.id}
                    itemStatus={item.status}
                    isClaimedByCurrentChurch={isClaimedByCurrentChurch}
                    currentChurchId={currentChurch.id}
                  />
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              {item.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Item Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Category:</span>
                  <span>{item.category}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Listed:</span>
                  <span>{item.createdAt.toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span>
                    {item.city}, {item.state}
                    {item.zipCode && ` ${item.zipCode}`}
                  </span>
                </div>

                {item.claimedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Claimed:</span>
                    <span>{item.claimedAt.toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Address if available */}
              {item.address && (
                <div className="pt-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium">Full Address:</span>
                      <div className="text-muted-foreground mt-1">
                        {item.address}
                        <br />
                        {item.city}, {item.state} {item.zipCode}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Providing Church Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Provided by {item.church.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">Church Address</div>
                    <div className="text-muted-foreground">
                      {item.church.address}
                      <br />
                      {item.church.city}, {item.church.state}{" "}
                      {item.church.zipCode}
                    </div>
                  </div>
                </div>

                {item.church.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={item.church.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {item.church.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Lead Pastor:</span>{" "}
                    {item.church.leadPastorName}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information - Only show if claimed by current church */}
          {isClaimedByCurrentChurch && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  You have claimed this item. Here's how to contact the
                  providing church:
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lead Contact Info */}
                <div>
                  <h4 className="font-medium mb-2">Lead Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {item.church.leadContact.firstName}{" "}
                        {item.church.leadContact.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${item.church.leadContact.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.church.leadContact.email}
                      </a>
                    </div>
                    {item.church.leadContact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${item.church.leadContact.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {item.church.leadContact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Item Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Item Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Status</span>
                <Badge
                  variant="outline"
                  className={
                    item.status === "AVAILABLE"
                      ? "text-green-600 border-green-200 bg-green-50"
                      : item.status === "CLAIMED"
                      ? "text-amber-600 border-amber-200 bg-amber-50"
                      : "text-blue-600 border-blue-200 bg-blue-50"
                  }
                >
                  {item.status}
                </Badge>
              </div>

              {item.status === "CLAIMED" && item.claimer && (
                <div className="pt-2 border-t">
                  <span className="text-sm font-medium">Claimed by</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.claimer.firstName} {item.claimer.lastName}
                  </p>
                  {isClaimedByCurrentChurch && (
                    <p className="text-xs text-blue-600 mt-1">
                      This is your church's claim
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 border-t text-xs text-muted-foreground">
                <p>Listed on {item.createdAt.toLocaleDateString()}</p>
                {item.claimedAt && (
                  <p>Claimed on {item.claimedAt.toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Guide */}
          {!isOwnItem && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                {item.status === "AVAILABLE" ? (
                  <>
                    <p>This item is available for claiming.</p>
                    <p>
                      Click "Claim Item" to reserve it for your church and get
                      contact information.
                    </p>
                  </>
                ) : isClaimedByCurrentChurch ? (
                  <>
                    <p>You have successfully claimed this item.</p>
                    <p>
                      Contact the providing church using the information above
                      to arrange pickup.
                    </p>
                  </>
                ) : (
                  <>
                    <p>This item has been claimed by another church.</p>
                    <p>Check back later as it may become available again.</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
