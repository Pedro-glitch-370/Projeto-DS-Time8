import "../../css/mapa.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import { MAP_CONFIG, ICONS } from "./constantesMapa.js";
import MapClickHandler from "./MapClickHandler.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import usePinosManagement from "./usePinosManagement.js";
import {
  handleSavePino,
  handleDeletePino,
  handlePinoClick,
} from "./acoesPinos.js";
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

  // Função que salva um pino e atualiza a configuração deles
  const onSavePino = useCallback(
    (dados) =>
      handleSavePino({
        dados,
        addPino,
        setIsSidebarOpen,
        setTempPin,
        setSelectedPino,
      }),
    [addPino]
  );

  // Função que deleta um pino e remove ele da configuração atual
  const onDeletePino = useCallback(
    (pinoId) =>
      handleDeletePino({
        pinoId,
        removePino,
        setIsSidebarOpen,
        setSelectedPino,
      }),
    [removePino]
  );

  // Função que lida com o clique em um pino
  const onPinoClick = useCallback(
    (pino) => handlePinoClick(pino, setSelectedPino, setIsSidebarOpen),
    []
  );

  // Pinos válidos memoizados
  const pinosValidos = useMemo(
    () => pinos.filter((pino) => pino.localizacao?.coordinates?.length === 2),
    [pinos]
  );

  // Estados de carregamento e erro
  if (loading) return <LoadingSpinner />;

  if (error && pinos.length === 0) {
    return (
      <div className="errorContainer">
        <h3>Erro ao carregar mapa</h3>
        <p>{error}</p>
        <button onClick={fetchPinos} className="retryButton">
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
        scrollWheelZoom={false}
        className="espacoMapa"
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        maxBounds={MAP_CONFIG.recifeBounds}
        maxBoundsViscosity={1.0}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
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
            eventHandlers={{ click: () => onPinoClick(pino) }}
          >
            <Popup>
              {/* style={styles.popupContent} */}
              <div classname="modal">
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
        onSave={onSavePino}
        onDelete={onDeletePino}
      />
    </>
  );
}

/*const styles = {
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
};*/
