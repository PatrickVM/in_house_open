// This file handles Leaflet initialization with Next.js
// Leaflet requires access to the Window object which isn't available during SSR

import { useEffect } from "react";

export function useLeafletInit() {
  useEffect(() => {
    const initializeLeaflet = async () => {
      try {
        // Import Leaflet CSS using require (CSS imports work better with require)
        require("leaflet/dist/leaflet.css");

        // Dynamic import of Leaflet library
        const L = await import("leaflet");

        // Fix for default icon images in Leaflet with Webpack/Next.js
        // @ts-ignore - This is a known Leaflet workaround
        delete L.default.Icon.Default.prototype._getIconUrl;

        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet/marker-icon-2x.png",
          iconUrl: "/leaflet/marker-icon.png",
          shadowUrl: "/leaflet/marker-shadow.png",
        });
      } catch (error) {
        console.error("Failed to initialize Leaflet:", error);
      }
    };

    initializeLeaflet();
  }, []);
}
