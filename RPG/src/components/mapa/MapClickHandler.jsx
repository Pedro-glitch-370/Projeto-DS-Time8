import { useMapEvents } from "react-leaflet";

// Função para capturar os cliques no mapa
export default function MapClickHandler({ setIsSidebarOpen, setTempPin, setSelectedPino }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setTempPin({ lat, lng });
      setSelectedPino(null);
      setIsSidebarOpen(true);
    },
  });
  return null;
}
