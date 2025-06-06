import { Suspense } from "react";
import { db } from "@/lib/db";
import MapContainer from "@/components/map/MapContainer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

// Server-side data fetching
async function getMapData() {
  try {
    // Get approved churches with their approved items using a single query with joins
    const churchesWithItems = await db.church.findMany({
      where: {
        applicationStatus: "APPROVED",
        items: {
          some: {
            moderationStatus: "APPROVED",
            status: {
              not: "COMPLETED",
            },
          },
        },
      },
      include: {
        items: {
          where: {
            moderationStatus: "APPROVED",
            status: {
              not: "COMPLETED",
            },
          },
          include: {
            claimer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        leadContact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      churchesWithItems,
    };
  } catch (error) {
    console.error("Error fetching map data:", error);
    return { churchesWithItems: [] };
  }
}

export default async function MapPage() {
  // Authentication and Authorization Check
  const session = (await getServerSession(authOptions as any)) as any;

  if (!session?.user) {
    redirect("/login?callbackUrl=/map");
  }

  // Allow ADMINs
  if (session.user.role === "ADMIN") {
    // Continue to map - ADMINs have full access
  }
  // Allow CHURCH users who are leadContacts for approved churches
  else if (session.user.role === "CHURCH") {
    const church = await db.church.findFirst({
      where: {
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!church) {
      // Church user is not a lead contact for an approved church
      redirect("/dashboard?error=map_access_denied");
    }
  }
  // Deny all other users (USER role, etc.)
  else {
    redirect("/dashboard?error=map_access_denied");
  }

  // Get data
  const { churchesWithItems } = await getMapData();

  // Get current user for map component
  const currentUser = session?.user
    ? {
        id: session.user.id as string,
        email: session.user.email as string,
        role: session.user.role as string,
      }
    : null;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">InHouse Network Map</h1>
      <p className="mb-8">
        Find items shared by churches in your community. Click on church markers
        to see available items.
      </p>

      <Suspense
        fallback={
          <div className="h-[600px] w-full bg-gray-100 animate-pulse" />
        }
      >
        <div className="rounded-lg overflow-hidden border shadow-md">
          <MapContainer
            churchesWithItems={churchesWithItems}
            currentUser={currentUser}
          />
        </div>
      </Suspense>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">About InHouse Network</h2>
          <p>
            InHouse Network connects churches and individuals to share resources
            and build community. Browse the map to see items available in your
            area.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">How It Works</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Browse the map to find churches with available items</li>
            <li>Click on church markers to see their items</li>
            <li>Sign in to view item details and contact churches</li>
            <li>Arrange pickup with the providing church</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
