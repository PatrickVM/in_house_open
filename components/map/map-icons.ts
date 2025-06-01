// Dynamic import approach to avoid SSR issues with Leaflet
export async function createMapIcons() {
  // Dynamic import of Leaflet - only runs on client side
  const L = await import("leaflet");

  // Church icon - using a different color marker
  const churchIcon = new L.default.Icon({
    iconUrl: "/leaflet/marker-icon.png",
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    shadowUrl: "/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // User icon - we'll use the default icon for now
  const userIcon = new L.default.Icon.Default();

  // Available item icon
  const availableItemIcon = new L.default.Icon({
    iconUrl: "/leaflet/marker-icon.png",
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    shadowUrl: "/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return { churchIcon, userIcon, availableItemIcon };
}

// Note: For a production app, we would use custom SVG icons or png files
// with different colors/designs for each type
