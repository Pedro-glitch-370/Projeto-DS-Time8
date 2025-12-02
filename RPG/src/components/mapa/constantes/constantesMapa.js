import L from "leaflet";

// Configurações do mapa
export const MAP_CONFIG = {
  center: [-8.063, -34.871],        // Centro do mapa (Recife)
  zoom: 15,                         // Zoom inicial
  minZoom: 13,                      // Zoom mínimo permitido
  maxZoom: 18,                      // Zoom máximo permitido
  recifeBounds: [                   // Limites geográficos (Recife e região)
    [-8.2, -35.05],                // Sudoeste
    [-7.9, -34.8],                 // Nordeste
  ],
};

// Ícones personalizados para os marcadores
export const ICONS = {
  default: L.Icon.Default,          // Ícone padrão do Leaflet (azul)
  temporary: L.icon({               // Ícone para pinos temporários (vermelho)
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],             // Tamanho do ícone
    iconAnchor: [12, 41],           // Ponto de ancoragem do ícone
    popupAnchor: [1, -34],          // Posição do popup em relação ao ícone
    shadowSize: [41, 41],           // Tamanho da sombra
  }),
};