import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchIcon, UserIcon } from "lucide-react";
import { authOptions } from "@/auth";

export default async function DirectoryPage() {
  // Get session to check if user is authenticated
  const session = (await getServerSession(authOptions as any)) as any;

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login?callbackUrl=/directory");
  }

  // Get users with completed profiles
  const users = await db.user.findMany({
    where: {
      // At least one of these fields must be defined
      OR: [
        { firstName: { not: null } },
        { lastName: { not: null } },
        { bio: { not: null } },
        { services: { not: null } },
      ],
      // Exclude the current user
      id: { not: session.user.id as string },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      bio: true,
      churchName: true,
      churchWebsite: true,
      services: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      phone: true,
    },
  });

  // Filter to users with at least 3 completed fields
  const completedUsers = users.filter((user) => {
    const fields = [
      user.firstName,
      user.lastName,
      user.bio,
      user.churchName,
      user.services,
    ];

    const completedFieldsCount = fields.filter(Boolean).length;
    return completedFieldsCount >= 3;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Community Directory</h1>
          <p className="text-muted-foreground mt-1">
            Connect with people in your community
          </p>
        </div>

        <div className="relative w-full md:w-auto md:min-w-[300px]">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by name or service..."
            type="search"
          />
        </div>
      </div>

      {completedUsers.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
          <h2 className="mt-4 text-lg font-medium">No users found</h2>
          <p className="mt-2 text-muted-foreground">
            Be the first to complete your profile and appear in the directory!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {completedUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <CardTitle>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </CardTitle>
                {user.churchName && (
                  <CardDescription>{user.churchName}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {user.bio && (
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                )}

                {/* Leaving this for reference, will most likely modify and use this to display general area based on longitude and latitude. */}
                {/* {(user.address || user.city || user.state || user.zipCode) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      LOCATION
                    </p>
                    <div className="text-sm">
                      {user.address && <p>{user.address}</p>}
                      {(user.city || user.state || user.zipCode) && (
                        <p>
                          {[user.city, user.state, user.zipCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                )} */}

                {(user.phone || user.email) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      CONTACT
                    </p>
                    <div className="text-sm space-y-1">
                      {user.phone && <p>{user.phone}</p>}
                      <p>{user.email}</p>
                    </div>
                  </div>
                )}

                {user.services && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      SERVICES & SKILLS
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {user.services.split(",").map((service, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {service.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
