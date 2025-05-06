// This file handles Leaflet initialization with Next.js
// Leaflet requires access to the Window object which isn't available during SSR

import { useEffect } from "react";

export function useLeafletInit() {
  useEffect(() => {
    // Dynamically import Leaflet CSS in the client
    require("leaflet/dist/leaflet.css");

    // Fix for default icon images in Leaflet with Webpack/Next.js
    const L = require("leaflet");

    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });
  }, []);
}
