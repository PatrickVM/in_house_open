"use client";

import { useEffect, useState } from "react";
import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import { useLeafletInit } from "@/lib/leaflet-setup";
import { churchIcon, userIcon, availableItemIcon } from "./map-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, Item } from "@/types";

// Define props interface
interface MapContainerProps {
  items: Item[];
  churches: User[];
  currentUser?: User | null;
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export default function MapContainer({
  items = [],
  churches = [],
  currentUser = null,
  height = "600px",
  initialCenter = [38.440429, -122.714055], // Santa Rosa coordinates
  initialZoom = 12,
}: MapContainerProps) {
  // SSR handling for Leaflet
  useLeafletInit();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle login/authentication requirement for item interaction
  const handleItemClick = (itemId: string) => {
    if (!currentUser) {
      // Redirect to login if not logged in
      // Could also use a modal instead
      window.location.href = `/login?redirect=/items/${itemId}`;
    } else {
      // Navigate to item detail page
      window.location.href = `/items/${itemId}`;
    }
  };

  if (!isMounted) {
    // Return placeholder while map loads client-side
    return (
      <div style={{ height, width: "100%", background: "#f0f0f0" }}>
        Loading map...
      </div>
    );
  }

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

      {/* Display churches */}
      {churches.map((church) =>
        church.latitude && church.longitude ? (
          <Marker
            key={`church-${church.id}`}
            position={[church.latitude, church.longitude]}
            icon={churchIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold">{church.churchName || "Church"}</h3>
                {church.address && <p>{church.address}</p>}
                <Link
                  href={`/profile/${church.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View Profile
                </Link>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}

      {/* Display available items */}
      {items.map((item) => (
        <Marker
          key={`item-${item.id}`}
          position={[item.latitude, item.longitude]}
          icon={availableItemIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.category}</p>
              <p className="my-1 text-sm line-clamp-2">{item.description}</p>
              <p className="text-xs text-gray-500">
                Listed by:{" "}
                {item.owner.churchName ||
                  `${item.owner.firstName} ${item.owner.lastName}`}
              </p>
              <Button
                className="mt-2 w-full"
                onClick={() => handleItemClick(item.id)}
                size="sm"
              >
                {currentUser ? "View Details" : "Sign in to View"}
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Display current user if they have location */}
      {currentUser?.latitude && currentUser?.longitude && (
        <Marker
          position={[currentUser.latitude, currentUser.longitude]}
          icon={userIcon}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">Your Location</h3>
              {currentUser.address && <p>{currentUser.address}</p>}
            </div>
          </Popup>
        </Marker>
      )}
    </LeafletMap>
  );
}
