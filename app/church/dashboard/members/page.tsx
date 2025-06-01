import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VerificationRequestCard from "@/components/church/VerificationRequestCard";
import { Users, Clock, CheckCircle, XCircle } from "lucide-react";

export default async function ChurchMembersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "CHURCH") {
    redirect("/login");
  }

  // Get the church associated with this user
  const church = await db.church.findFirst({
    where: {
      leadContactId: session.user.id,
      applicationStatus: "APPROVED",
    },
    include: {
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          churchMembershipStatus: true,
          createdAt: true,
        },
        orderBy: {
          firstName: "asc",
        },
      },
      verificationRequests: {
        where: {
          status: "PENDING",
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              bio: true,
              services: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!church) {
    redirect("/church/dashboard");
  }

  const verifiedMembers = church.members.filter(
    (member) => member.churchMembershipStatus === "VERIFIED"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Church Members</h1>
        <p className="text-muted-foreground">
          Manage your church community and verification requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Members
                </p>
                <p className="text-2xl font-bold">{verifiedMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Requests
                </p>
                <p className="text-2xl font-bold">
                  {church.verificationRequests.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Min Verifications
                </p>
                <p className="text-2xl font-bold">
                  {church.minVerificationsRequired}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Verification Requests */}
      {church.verificationRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Verification Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {church.verificationRequests.map((request) => (
              <VerificationRequestCard
                key={request.id}
                request={{
                  id: request.id,
                  user: request.user,
                  createdAt: request.createdAt,
                  notes: request.notes,
                }}
                churchId={church.id}
                isLeadContact={true}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Church Members ({verifiedMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verifiedMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No members yet</h3>
              <p className="text-muted-foreground">
                Members will appear here once they are verified
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {verifiedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">
                      {member.firstName && member.lastName
                        ? `${member.firstName} ${member.lastName}`
                        : member.email}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
