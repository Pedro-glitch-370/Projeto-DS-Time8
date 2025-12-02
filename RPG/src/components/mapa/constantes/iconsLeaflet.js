import L from "leaflet";

// Ícones personalizados para localização do usuário
export const createUserLocationIcon = () => L.divIcon({
  className: 'user-location-marker',
  html: `<div class="user-location-pulse"><div class="user-location-dot"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export const createUserLocationUpdatingIcon = () => L.divIcon({
  className: 'user-location-marker updating',
  html: `<div class="user-location-pulse updating"><div class="user-location-dot updating"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export const createUserLocationFallbackIcon = () => L.divIcon({
  className: 'user-location-marker fallback',
  html: `<div class="user-location-pulse" style="border-color: #fdcb6e;"><div class="user-location-dot" style="background: #fdcb6e;"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});