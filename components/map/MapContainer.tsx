"use client";

import { useEffect, useState } from "react";
import { useLeafletInit } from "@/lib/leaflet-setup";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define the church with items type based on our database query
interface ChurchWithItems {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  leadContact: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  items: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    status: string;
    createdAt: Date;
    claimer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    } | null;
  }>;
}

// Define props interface
interface MapContainerProps {
  churchesWithItems: ChurchWithItems[];
  currentUser?: {
    id: string;
    email: string;
    role: string;
  } | null;
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export default function MapContainer({
  churchesWithItems = [],
  currentUser = null,
  height = "600px",
  initialCenter = [30.5, -89.0], // Center between Louisiana and Florida panhandle
  initialZoom = 7, // Broader zoom level to show southeastern states
}: MapContainerProps) {
  // State for dynamic imports
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapComponents, setMapComponents] = useState<any>(null);
  const [icons, setIcons] = useState<any>(null);

  // SSR handling for Leaflet
  useLeafletInit();

  useEffect(() => {
    // Dynamic import of all map components and icons
    const loadMapComponents = async () => {
      try {
        // Import react-leaflet components dynamically
        const [leafletComponents, { createMapIcons }] = await Promise.all([
          import("react-leaflet"),
          import("./map-icons"),
        ]);

        // Create map icons
        const mapIcons = await createMapIcons();

        setMapComponents({
          MapContainer: leafletComponents.MapContainer,
          TileLayer: leafletComponents.TileLayer,
          Marker: leafletComponents.Marker,
          Popup: leafletComponents.Popup,
        });

        setIcons(mapIcons);
        setIsMapReady(true);
      } catch (error) {
        console.error("Failed to load map components:", error);
      }
    };

    loadMapComponents();
  }, []);

  // Handle item interaction
  const handleItemClick = (itemId: string) => {
    if (!currentUser) {
      // Redirect to login if not logged in
      window.location.href = `/login?redirect=/items/${itemId}`;
    } else {
      // Navigate to item detail page (to be implemented)
      window.location.href = `/items/${itemId}`;
    }
  };

  // Handle church profile link
  const handleChurchProfileClick = (churchId: string) => {
    window.location.href = `/churches/${churchId}`;
  };

  if (!isMapReady || !mapComponents || !icons) {
    // Return placeholder while map loads client-side
    return (
      <div style={{ height, width: "100%", background: "#f0f0f0" }}>
        Loading map...
      </div>
    );
  }

  const { MapContainer: LeafletMap, TileLayer, Marker, Popup } = mapComponents;
  const { churchIcon } = icons;

  return (
    <LeafletMap
      center={initialCenter}
      zoom={initialZoom}
      style={{ height, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Display churches with their items */}
      {churchesWithItems.map((church) =>
        church.latitude && church.longitude ? (
          <Marker
            key={`church-${church.id}`}
            position={[church.latitude, church.longitude]}
            icon={churchIcon}
          >
            <Popup maxWidth={400} className="church-popup">
              <div className="p-2">
                <div className="mb-3 border-b pb-2">
                  <h3 className="font-bold text-lg">{church.name}</h3>
                  <p className="text-sm text-gray-600">
                    {church.address}, {church.city}, {church.state}{" "}
                    {church.zipCode}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-white"
                    onClick={() => handleChurchProfileClick(church.id)}
                  >
                    View Church Profile
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-md">
                    Available Items ({church.items.length})
                  </h4>

                  {church.items.length === 0 ? (
                    <p className="text-sm text-gray-500">No items available</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {church.items.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded p-2 bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-medium text-sm">
                              {item.title}
                            </h5>
                            <Badge
                              variant={
                                item.status === "AVAILABLE"
                                  ? "default"
                                  : item.status === "CLAIMED"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {item.status}
                            </Badge>
                          </div>

                          <p className="text-xs text-gray-600 mb-1">
                            {item.category}
                          </p>

                          {item.description && (
                            <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Listed by {church.name}
                            </span>

                            {item.status === "AVAILABLE" && (
                              <Button
                                size="sm"
                                className="text-xs px-2 py-1 h-6"
                                onClick={() => handleItemClick(item.id)}
                              >
                                {currentUser
                                  ? "View Details"
                                  : "Sign in to View"}
                              </Button>
                            )}
                          </div>

                          {item.claimer && (
                            <p className="text-xs text-amber-600 mt-1">
                              Claimed by {item.claimer.firstName}{" "}
                              {item.claimer.lastName}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </LeafletMap>
  );
}
