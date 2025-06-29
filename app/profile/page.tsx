import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CircleIcon,
  User2Icon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import { authOptions } from "@/auth";
import { calculateProfileCompletion } from "@/lib/profile-completion";

export default async function ProfilePage() {
  // Get session to check if user is authenticated
  const session = (await getServerSession(authOptions as any)) as any;

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  // Get full user data from database including church relationship
  const user = await db.user.findUnique({
    where: { id: session.user.id as string },
    include: {
      church: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Check if user has an existing church application or is already a church
  const existingChurchApplication = await db.church.findFirst({
    where: {
      leadContactId: user.id,
    },
  });

  // Determine church application link behavior
  const getChurchApplicationStatus = () => {
    if (user.role === "CHURCH") return "hidden"; // Already approved church
    if (!existingChurchApplication) return "show"; // No application, show signup link

    switch (existingChurchApplication.applicationStatus) {
      case "PENDING":
        return "pending";
      case "REJECTED":
        return "rejected";
      case "APPROVED":
        return "hidden"; // Approved but role not updated yet
      default:
        return "hidden";
    }
  };

  const churchApplicationStatus = getChurchApplicationStatus();

  // Calculate profile completion percentage using standardized utility
  const { completionPercentage, missingFields } =
    calculateProfileCompletion(user);

  // Check if profile is complete enough to show in directory
  const isProfileComplete = completionPercentage >= 80;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        {/* May change or get rid of later.  */}
        <nav className="ml-auto flex gap-4 items-center">
          <Link
            href="/profile/edit"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Edit Profile
          </Link>
          <Link
            href="/invite-church"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Invite Church
          </Link>
          {/* will initialize in phase 2 */}
          {/* <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            List Item
          </Link> */}
          {churchApplicationStatus === "show" && (
            <Link
              href="/church/apply"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Church Application Signup
            </Link>
          )}
          {churchApplicationStatus === "pending" && (
            <span className="text-sm font-medium text-amber-600">
              Application Under Review
            </span>
          )}
          {churchApplicationStatus === "rejected" && (
            <span className="text-sm font-medium text-red-600">
              Check Email for Details
            </span>
          )}
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    {isProfileComplete ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircleIcon className="mr-1 h-3 w-3" /> Complete
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-amber-500 border-amber-200 bg-amber-50"
                      >
                        <CircleIcon className="mr-1 h-3 w-3 fill-amber-500" />{" "}
                        Incomplete
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                      PERSONAL
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <User2Icon className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <p className="font-medium">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : "Not provided"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {user.bio && (
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">
                        BIO
                      </h3>
                      <p>{user.bio}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                      CHURCH
                    </h3>
                    {user.churchMembershipStatus === "VERIFIED" &&
                    user.church ? (
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.church.name}</p>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          <CheckCircleIcon className="mr-1 h-3 w-3" /> Verified
                        </Badge>
                      </div>
                    ) : user.churchMembershipStatus === "REQUESTED" ? (
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">
                          Verification Pending
                        </p>
                        <Badge
                          variant="outline"
                          className="text-amber-500 border-amber-200 bg-amber-50"
                        >
                          <CircleIcon className="mr-1 h-3 w-3 fill-amber-500" />{" "}
                          Pending
                        </Badge>
                      </div>
                    ) : (
                      <p>{user.churchName || "Not provided"}</p>
                    )}
                    {user.churchWebsite && (
                      <a
                        href={user.churchWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {user.churchWebsite}
                      </a>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                      SERVICES & SKILLS
                    </h3>
                    {user.services ? (
                      <div className="flex flex-wrap gap-1">
                        {user.services.split(",").map((service, index) => (
                          <Badge key={index} variant="secondary">
                            {service.trim()}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No services or skills listed
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                      LOCATION
                    </h3>
                    {user.address || user.city || user.state || user.zipCode ? (
                      <div className="space-y-1">
                        {user.address && <div>{user.address}</div>}
                        {(user.city || user.state || user.zipCode) && (
                          <div>
                            {[user.city, user.state, user.zipCode]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        No location provided
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                      CONTACT
                    </h3>
                    <p>{user.phone || "Not provided"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {completionPercentage}% complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        {!missingFields.includes("First Name") ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <CircleIcon className="h-4 w-4 text-gray-300 mr-2" />
                        )}
                        <span>Add your name</span>
                      </li>
                      <li className="flex items-center">
                        {!missingFields.includes("Bio") ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <CircleIcon className="h-4 w-4 text-gray-300 mr-2" />
                        )}
                        <span>Add a bio</span>
                      </li>
                      <li className="flex items-center">
                        {!missingFields.includes("Church Information") ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <CircleIcon className="h-4 w-4 text-gray-300 mr-2" />
                        )}
                        <span>Add church information</span>
                      </li>
                      <li className="flex items-center">
                        {!missingFields.includes("Services & Skills") ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <CircleIcon className="h-4 w-4 text-gray-300 mr-2" />
                        )}
                        <span>List your services/skills</span>
                      </li>
                      <li className="flex items-center">
                        {!missingFields.includes("Location") ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <CircleIcon className="h-4 w-4 text-gray-300 mr-2" />
                        )}
                        <span>Add your location</span>
                      </li>
                      <li className="flex items-center">
                        {!missingFields.includes("Phone Number") ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <CircleIcon className="h-4 w-4 text-gray-300 mr-2" />
                        )}
                        <span>Add phone number (optional)</span>
                      </li>
                    </ul>
                  </div>

                  {!isProfileComplete && (
                    <Link href="/profile/edit" className="w-full mt-4 block">
                      <Button className="w-full mt-4 flex items-center justify-center">
                        Complete Profile
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Directory Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    {isProfileComplete
                      ? "Your profile is visible in the directory."
                      : "Complete your profile to appear in the directory."}
                  </p>
                  <Link
                    href={isProfileComplete ? "/directory" : "/profile/edit"}
                  >
                    <Button
                      variant={isProfileComplete ? "default" : "outline"}
                      className="w-full"
                    >
                      {isProfileComplete
                        ? "View Directory"
                        : "Complete Profile"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
