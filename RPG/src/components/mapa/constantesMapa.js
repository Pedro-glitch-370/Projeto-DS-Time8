import L from "leaflet";

export const MAP_CONFIG = {
  center: [-8.063, -34.871],
  zoom: 15,
  minZoom: 13,
  maxZoom: 18,
  recifeBounds: [
    [-8.2, -35.05],
    [-7.9, -34.8],
  ],
};

export const ICONS = {
  default: L.Icon.Default,
  temporary: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};
