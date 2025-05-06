import { Suspense } from "react";
import { db } from "@/lib/db";
import MapContainer from "@/components/map/MapContainer";
import { User, Item, UserRole } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

// Server-side data fetching
async function getMapData() {
  try {
    // Get churches
    const churches = await db.user.findMany({
      where: {
        role: UserRole.CHURCH,
      },
    });

    // Since we haven't migrated the database yet, we'll return mock data for now
    // In a production app, this would query actual items
    const mockItems: Item[] = [];

    return {
      churches: churches as unknown as User[],
      items: mockItems,
    };
  } catch (error) {
    console.error("Error fetching map data:", error);
    return { churches: [], items: [] };
  }
}

export default async function MapPage() {
  // Get data
  const { churches, items } = await getMapData();

  // Get current user
  const session = await getServerSession(authOptions);
  const currentUser = session?.user
    ? {
        id: session.user.id as string,
        email: session.user.email as string,
        role: session.user.role as UserRole,
      }
    : null;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">InHouse Network Map</h1>
      <p className="mb-8">
        Find items shared by churches in your community. Click on markers to see
        details.
      </p>

      <Suspense
        fallback={
          <div className="h-[600px] w-full bg-gray-100 animate-pulse" />
        }
      >
        <div className="rounded-lg overflow-hidden border shadow-md">
          <MapContainer
            churches={churches}
            items={items}
            currentUser={currentUser as unknown as User}
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
            <li>Browse the map to find available items</li>
            <li>Sign in to view item details</li>
            <li>Request an item you need</li>
            <li>Arrange pickup with the providing church</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
