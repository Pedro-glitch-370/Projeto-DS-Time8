import "../../css/mapa.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import api from "../../services/api";
import Sidebar from "../barra-lateral/barra-lateral.jsx";

// =================================================================
// Pra evitar problemas de caminho
delete L.Icon.Default.prototype._getIconUrl;

// URLs corretas dos ícones dos pinos
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// =================================================================
// Constantes e configurações
const MAP_CONFIG = {
  center: [-8.063, -34.871],
  zoom: 15,
  minZoom: 13,
  maxZoom: 18,
  recifeBounds: [
    [-8.2, -35.05],
    [-7.9, -34.8],
  ],
};

const ICONS = {
  default: L.Icon.Default,
  temporary: L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

// =================================================================
// Função pra capturar os cliques no mapa
function MapClickHandler({ setIsSidebarOpen, setTempPin, setSelectedPino }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      console.log("🗺️ Clique no mapa:", { lat, lng });
      setTempPin({ lat, lng });
      setSelectedPino(null);
      setIsSidebarOpen(true);
    },
  });
  return null;
}

// =================================================================
// Função pra carregar o mapa
function LoadingSpinner() {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p>Carregando mapa...</p>
    </div>
  );
}

// =================================================================
// Hook (função que intercepta eventos) pra gerenciar pinos
function usePinosManagement() {
  const [pinos, setPinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função pra buscar os pinos da API
  const fetchPinos = useCallback(async () => {
    try {
      console.log("🔄 Buscando pinos...");
      setLoading(true);
      setError(null);

      // Faz a requisição para a API do backend
      const response = await api.get("/pinos");
      console.log("✅ Pinos carregados:", response.data);

      const pinosValidos = response.data.filter(
        (pino) => pino.localizacao?.coordinates?.length === 2
      );

      if (pinosValidos.length !== response.data.length) {
        console.warn("⚠️ Alguns pinos foram filtrados por dados inválidos");
      }

      // Atualiza o estado com os pinos recebidos
      setPinos(pinosValidos);
    } catch (err) {
      // Se a requisição falhar
      console.error("❌ Erro ao buscar pinos:", err);
      setError(err.message);

      // Pino de fallback (quando o backend não tá disponível)
      const fallbackPinos = [
        {
          _id: "fallback-99",
          localizacao: { coordinates: [-8.0696, -34.888016] },
          msg: "Pintar e Renovar Quadra Campo dos Coelhos",
          nome: "Quadra Campo dos Coelhos (Offline)",
        },
      ];

      setPinos(fallbackPinos);
    } finally {
      // Sempre acontece, é pra finaliza o estado de carregamento
      setLoading(false);
    }
  }, []); // Só será executada uma única vez por causa do []

  const addPino = useCallback((newPino) => {
    setPinos((prev) => [...prev, newPino]);
  }, []);

  const removePino = useCallback((pinoId) => {
    setPinos((prev) =>
      prev.filter((pino) => pino._id !== pinoId && pino.id !== pinoId)
    );
  }, []);

  return {
    pinos,
    loading,
    error,
    fetchPinos,
    addPino,
    removePino,
  };
}

// =================================================================
// Componente principal
export default function Mapa() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tempPin, setTempPin] = useState(null);
  const [selectedPino, setSelectedPino] = useState(null);

  const { pinos, loading, error, fetchPinos, addPino, removePino } =
    usePinosManagement();

  // Efeito pra buscar os pinos
  useEffect(() => {
    fetchPinos();
  }, [fetchPinos]);

  // Função pra salvar o pino
  const handleSavePino = useCallback(
    async (dados) => {
      try {
        console.log("💾 Salvando pino:", dados);

        const pinoData = {
          nome: dados.nome,
          msg: dados.msg,
          latitude: dados.coordinates[1],
          longitude: dados.coordinates[0],
        };

        const response = await api.post("/pinos/adicionar", pinoData);
        console.log("✅ Pino salvo:", response.data);

        if (response.data.localizacao?.coordinates) {
          addPino(response.data);
        }

        setIsSidebarOpen(false);
        setTempPin(null);
        setSelectedPino(null);

        alert("Ponto salvo com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao salvar pino:", error);
        const message =
          error.response?.data?.message ||
          error.response?.data ||
          "Erro de conexão";
        alert(`Erro ao salvar: ${message}`);
      }
    },
    [addPino]
  );

  // Função pra deletar pino
  const handleDeletePino = useCallback(
    async (pinoId) => {
      try {
        console.log("🗑️ Deletando pino:", pinoId);

        if (!pinoId) {
          alert("ID do pino não encontrado");
          return;
        }

        const confirmacao = window.confirm(
          "Tem certeza que deseja deletar este pino?"
        );
        if (!confirmacao) return;

        await api.delete(`/pinos/deletar/${pinoId}`);

        removePino(pinoId);
        setIsSidebarOpen(false);
        setSelectedPino(null);

        alert("Pino deletado com sucesso! ✅");
      } catch (error) {
        console.error("❌ Erro ao deletar pino:", error);
        const message =
          error.response?.data?.message ||
          error.response?.data ||
          "Erro de conexão";
        alert(`Erro ao deletar: ${message}`);
      }
    },
    [removePino]
  );

  // Função pra clicar em um pino existente
  const handlePinoClick = useCallback((pino) => {
    setSelectedPino(pino);
    setIsSidebarOpen(true);
  }, []);

  // Pinos válidos memoizados
  const pinosValidos = useMemo(
    () => pinos.filter((pino) => pino.localizacao?.coordinates?.length === 2),
    [pinos]
  );

  // Estados de carregamento e erro
  if (loading) return <LoadingSpinner />;

  if (error && pinos.length === 0) {
    return (
      <div style={styles.errorContainer}>
        <h3>Erro ao carregar mapa</h3>
        <p>{error}</p>
        <button onClick={fetchPinos} style={styles.retryButton}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  // =================================================================
  // Retorna mapa e cada pino
  return (
    <>
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        style={styles.map}
        maxBounds={MAP_CONFIG.recifeBounds}
        maxBoundsViscosity={1.0}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        className="espacoMapa"
      >
        <TileLayer url="https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=txyn1dkLKLyeAVZpRphN9bgMLMXyX4ID2M7twL0qufk633O6XjmXLC2W54qmibZF" />

        <MapClickHandler
          setIsSidebarOpen={setIsSidebarOpen}
          setTempPin={setTempPin}
          setSelectedPino={setSelectedPino}
        />

        {/* Pino temporário */}
        {tempPin && (
          <Marker position={[tempPin.lat, tempPin.lng]} icon={ICONS.temporary}>
            <Popup>
              <strong>Novo Ponto</strong>
              <br />
              Preencha as informações ao lado para salvar.
            </Popup>
          </Marker>
        )}

        {/* Pinos existentes */}
        {pinosValidos.map((pino) => (
          // Renderiza cada pino em sua posição junto com sua mensagem
          <Marker
            key={pino._id || pino.id}
            position={[
              pino.localizacao.coordinates[1],
              pino.localizacao.coordinates[0],
            ]}
            eventHandlers={{ click: () => handlePinoClick(pino) }}
          >
            <Popup>
              <div className="modal">
                <h3>{pino.titulo}</h3>

                {/*Upload da foto*/}
                <label htmlFor={`foto-${pino.id}`}>
                  <img
                    className="imagem"
                    src="/src/assets/AdicionarFoto.png"
                    alt="Adicionar Foto"
                  ></img>
                </label>
                <input
                  type="file"
                  id={`foto-${pino.id}`}
                  accept="image/*"
                  title="Enviar Foto"
                  className="inputFoto"
                />

                {/*Descrição da atividade e recompensa*/}
                <p>{pino.msg}</p>
                <p>
                  <strong>{pino.recompensa}</strong>
                </p>

                {/*Botão de confirmação */}
                <button className="botaoConfirmar">
                  Confirme sua presença
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
          setTempPin(null);
          setSelectedPino(null);
        }}
        tempPin={tempPin}
        selectedPino={selectedPino}
        onSave={handleSavePino}
        onDelete={handleDeletePino}
      />
    </>
  );
}

const styles = {
  container: {
    position: "relative",
    height: "100vh",
    width: "100%",
  },
  map: {
    height: "100%",
    width: "100%",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "18px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "10px",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    padding: "20px",
    textAlign: "center",
  },
  retryButton: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  },
  popupContent: {
    minWidth: "200px",
  },
  manageButton: {
    padding: "5px 10px",
    backgroundColor: "#ff4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
    width: "100%",
  },
};

// CSS para a animação do spinner
const spinnerStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Adiciona os estilos do spinner ao documento
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = spinnerStyles;
  document.head.appendChild(styleSheet);
}
