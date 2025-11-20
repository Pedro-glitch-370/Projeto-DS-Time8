import "../../css/mapa.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { useEffect, useState, useCallback, useMemo } from "react";

// No topo do Mapa.jsx, adicione:
import "../../components/barra-superior/barra-superior.css";
import { handleSavePino, handleDeletePino, handlePinoClick } from "./acoesPinos.js";
import { MAP_CONFIG, ICONS } from "./constantesMapa.js";
import usePinosManagement from "./usePinosManagement.js";
import MapClickHandler from "./MapClickHandler.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import Sidebar from "../barra-lateral/barra-lateral.jsx";
import { authService } from "../../services/authService.js";

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
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const { pinos, loading, error, fetchPinos, addPino, removePino } =
    usePinosManagement();

  // Efeito pra verificar autenticação
  useEffect(() => {
    const checkAuth = () => {
      const userData = authService.getUser();
      if (userData) {
        setUser(userData);
        setIsAdmin(authService.isAdmin());
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // Efeito pra buscar os pinos
  useEffect(() => {
    if (!isCheckingAuth) {
      fetchPinos();
    }
  }, [isCheckingAuth, fetchPinos]);

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

  // Mostra loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // Estados de carregamento e erro
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando mapa...</p>
      </div>
    );
  }

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
    <div className="mapa-container">
      {/* SUA BARRA SUPERIOR PERSONALIZADA - SEMPRE com botão ENTRAR */}
      <nav className="barra-superior">
        <div className="esquerda">
          <img 
            src="/src/assets/LogoConecta.png" 
            alt="Logo" 
            className="logo-img"
            onClick={() => window.location.href = 'index.html'}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="meio">
          <a href="index.html">Mapa</a>
          <a href="tarefa.html">Minhas Tarefas</a>
          <a href="saldo.html">Capibas</a>
        </div>
        <div className="direita">
          {/* SEMPRE mostra o botão ENTRAR, independente de estar logado ou não */}
          <a 
            href="#login"
            id="login"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = 'login.html';
            }}
          >
            Entrar
          </a>
          <div className="opcoes" id="opcoes">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </nav>

      {/* Container do mapa - com margin-top para não ficar embaixo da barra fixa */}
      <div style={{ marginTop: '70px', height: 'calc(100vh - 70px)' }}>
        <MapContainer
          scrollWheelZoom={false}
          className="espacoMapa"
          style={{ height: '100%', width: '100%' }}
          center={MAP_CONFIG.center}
          zoom={MAP_CONFIG.zoom}
          zoomControl={false}
          maxBounds={MAP_CONFIG.recifeBounds}
          maxBoundsViscosity={1.0}
          minZoom={MAP_CONFIG.minZoom}
          maxZoom={MAP_CONFIG.maxZoom}
        >
          <TileLayer 
            url="https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=txyn1dkLKLyeAVZpRphN9bgMLMXyX4ID2M7twL0qufk633O6XjmXLC2W54qmibZF"
            attribution='&copy; <a href="https://www.jawg.io/">Jawg</a>'
          />

          <ZoomControl position="bottomleft" />

          {/* Só mostra MapClickHandler se for admin */}
          {isAdmin && (
            <MapClickHandler
              setIsSidebarOpen={setIsSidebarOpen}
              setTempPin={setTempPin}
              setSelectedPino={setSelectedPino}
            />
          )}

          {/* Pino temporário (apenas para admin) */}
          {tempPin && isAdmin && (
            <Marker position={[tempPin.lat, tempPin.lng]} icon={ICONS.temporary}>
              <Popup>
                <div className="popUpNovoPonto">
                  <strong>Novo Ponto</strong>
                  Preencha as informações ao lado para salvar.
                </div>
              </Popup>
            </Marker>
          )}

          {/* Pinos existentes - TODOS podem ver, mesmo sem login */}
          {pinosValidos.map((pino) => (
            <Marker
              key={pino._id || pino.id}
              position={[
                pino.localizacao.coordinates[1],
                pino.localizacao.coordinates[0],
              ]}
              eventHandlers={{ 
                click: () => onPinoClick(pino)
              }}
            >
              <Popup>
                <div className="modal">
                  <h3 className="mensagem">{pino.nome}</h3>

                  {/* Upload da foto */}
                  <label htmlFor={`foto-${pino.id}`}>
                    <img
                      className="imagem"
                      src="/src/assets/AdicionarFoto.png"
                      alt="Adicionar Foto"
                    />
                  </label>
                  <input
                    type="file"
                    id={`foto-${pino.id}`}
                    accept="image/*"
                    title="Enviar Foto"
                    className="inputFoto"
                  />

                  {/* Descrição da atividade e recompensa */}
                  <p className="mensagem">{pino.msg}</p>
                  <p className="mensagem">
                    <strong>Recompensa: xx capibas</strong>
                  </p>

                  {/* Botão de confirmação - TODOS podem usar */}
                  <button className="botaoConfirmar">
                    Confirme sua presença
                  </button>

                  {/* Botão de edição - APENAS para admins logados */}
                  {isAdmin && (
                    <button 
                      className="botaoEditar"
                      onClick={() => onPinoClick(pino)}
                      style={{
                        background: '#ffc107',
                        color: 'black',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        marginTop: '0.5rem',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      ✏️ Editar Pino
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Sidebar - APENAS para admins logados */}
      {isAdmin && (
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
          user={user}
        />
      )}
    </div>
  );
}