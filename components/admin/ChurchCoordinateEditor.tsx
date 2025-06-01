"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Save, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ChurchCoordinateEditorProps {
  church: {
    id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
  };
}

export default function ChurchCoordinateEditor({
  church,
}: ChurchCoordinateEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latitude, setLatitude] = useState(church.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(
    church.longitude?.toString() || ""
  );

  const handleSave = async () => {
    if (!latitude || !longitude) {
      toast.error("Please enter both latitude and longitude coordinates");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid numeric coordinates");
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/churches/${church.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update coordinates");
      }

      toast.success("Church coordinates updated successfully");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating coordinates:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update coordinates"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setLatitude(church.latitude?.toString() || "");
    setLongitude(church.longitude?.toString() || "");
    setIsEditing(false);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Church Coordinates
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          // Display mode
          <div className="space-y-2">
            {church.latitude && church.longitude ? (
              <div>
                <p className="text-gray-200">
                  <span className="font-medium">Latitude:</span>{" "}
                  {church.latitude.toFixed(6)}
                </p>
                <p className="text-gray-200">
                  <span className="font-medium">Longitude:</span>{" "}
                  {church.longitude.toFixed(6)}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-900/20 border border-amber-700 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
                  <div className="text-sm text-amber-200">
                    <p className="font-medium">No coordinates set</p>
                    <p>
                      This church doesn't have coordinates configured for map
                      display.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Edit mode
          <div className="space-y-4">
            <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-md">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-200">
                    Update Church Location
                  </h4>
                  <p className="text-sm text-blue-300 mt-1">
                    Enter the precise latitude and longitude coordinates for{" "}
                    {church.name}. This will update the church's location on the
                    map.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="latitude" className="text-gray-300">
                  Latitude *
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 38.440429"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="mt-1 bg-gray-700 border-gray-600 text-gray-100"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Range: -90 to 90 (North/South)
                </p>
              </div>
              <div>
                <Label htmlFor="longitude" className="text-gray-300">
                  Longitude *
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., -122.714055"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="mt-1 bg-gray-700 border-gray-600 text-gray-100"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Range: -180 to 180 (East/West)
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-900/20 border border-amber-700 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
                <div className="text-sm text-amber-200">
                  <p className="font-medium">Important:</p>
                  <p>Updating coordinates will:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Change the church's location on the map</li>
                    <li>
                      Affect how items from this church are displayed
                      geographically
                    </li>
                    <li>Update the church's profile information</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Coordinates"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSubmitting}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
