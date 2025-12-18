import { useMapEvents } from "react-leaflet";

/**
 * Manipulador de cliques no mapa - captura coordenadas e gerencia estado da UI
 */
export default function MapClickHandler({ 
  setIsSidebarOpen,  // Function: controla abertura/fechamento da sidebar
  setTempPin,        // Function: armazena coordenadas do pin temporário
  setSelectedPino    // Function: limpa pino selecionado
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setTempPin({ lat, lng });      // Armazena coordenadas do clique
      setSelectedPino(null);         // Deseleciona pino atual
      setIsSidebarOpen(true);        // Abre sidebar para criar novo pin
    },
  });
  
  return null; // Componente não renderiza elementos visuais
}