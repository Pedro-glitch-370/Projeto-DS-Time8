import "../../css/mapa.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";

// Serviços e componentes
import { handleSavePino, handleDeletePino, handleUpdatePino } from "./acoesPinos.js";
import { MAP_CONFIG, ICONS } from "./constantes/constantesMapa.js";
import { createUserLocationIcon, createUserLocationUpdatingIcon, createUserLocationFallbackIcon } from "./constantes/iconsLeaflet.js";
import usePinosManagement from "./usePinosManagement.js";
import MapClickHandler from "./MapClickHandler.jsx";
import Sidebar from "../barra-lateral/barra-lateral.jsx";
import { authService } from "../../services/authService.js";

import StatusLocalizacao from "./StatusLocalizacao.jsx";
import { localizacaoService } from "../../services/localizacaoService.js";
import { clienteService } from "../../services/clienteService.js";
import { adminService } from "../../services/adminService.js";

// Configuração do Leaflet - remove URLs padrão
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Componente principal do mapa
export default function Mapa() {
  // Estados da UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tempPin, setTempPin] = useState(null);
  const [selectedPino, setSelectedPino] = useState(null);
  
  // Estados de autenticação
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Estados de localização
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [permissaoLocalizacao, setPermissaoLocalizacao] = useState(null);
  const [validandoLocalizacao, setValidandoLocalizacao] = useState(false);
  const [mensagemLocalizacao, setMensagemLocalizacao] = useState("");
  const [rastreamentoAtivo, setRastreamentoAtivo] = useState(false);
  const [precisaoLocalizacao, setPrecisaoLocalizacao] = useState(null);
  const [atualizandoLocalizacao, setAtualizandoLocalizacao] = useState(false);
  
  // Estado de tarefas concluídas
  const [tarefasConcluidas, setTarefasConcluidas] = useState(new Set());

  const watchIdRef = useRef(null);
  const { pinos, loading, error, fetchPinos, addPino, removePino, updatePino } = usePinosManagement();

  // Verifica autenticação ao carregar
  useEffect(() => {
    const userData = authService.getUser();
    if (userData) {
      setUser(userData);
      setIsAdmin(authService.isAdmin());
      if (userData.tarefasConcluidas) {
        setTarefasConcluidas(new Set(userData.tarefasConcluidas));
      }
    }
    setIsCheckingAuth(false);
  }, []);

  // Atualiza dados do usuário (capibas e tarefas)
  const atualizarDadosUsuario = useCallback(async () => {
    try {
      const userData = authService.getUser();
      if (userData?.id) {
        const usuarioAtualizado = await clienteService.getCliente(userData.id);
        if (usuarioAtualizado.user) {
          setUser(usuarioAtualizado.user);
          if (usuarioAtualizado.user.tarefasConcluidas) {
            setTarefasConcluidas(new Set(usuarioAtualizado.user.tarefasConcluidas));
          }
          authService.updateUserData(usuarioAtualizado.user);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  }, []);

  // Verifica se tarefa já foi concluída
  const isTarefaConcluida = useCallback((pinoId) => {
    return tarefasConcluidas.has(pinoId);
  }, [tarefasConcluidas]);

  // Solicita permissão de localização
  useEffect(() => {
    const solicitarPermissaoLocalizacao = async () => {
      try {
        setMensagemLocalizacao("📍 Obtendo sua localização...");
        const coords = await localizacaoService.solicitarLocalizacao();
        setLocalizacaoUsuario(coords);
        setPermissaoLocalizacao(true);
        setMensagemLocalizacao("");
        
        if (coords.metodo !== 'fallback') {
          iniciarRastreamentoLocalizacao();
        } else {
          setMensagemLocalizacao("📍 Usando localização padrão. Ative o GPS para melhor precisão.");
          setTimeout(() => setMensagemLocalizacao(""), 5000);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setPermissaoLocalizacao(false);
        setMensagemLocalizacao("📍 Permissão necessária. Clique em 'Atualizar' quando permitir.");
        
        // Fallback para localização padrão (Recife)
        setLocalizacaoUsuario({
          latitude: -8.063163,
          longitude: -34.871139,
          precisao: 1000,
          metodo: 'fallback'
        });
        setPermissaoLocalizacao(true);
      }
    };

    if (!isCheckingAuth) {
      solicitarPermissaoLocalizacao();
    }

    return () => {
      if (watchIdRef.current) {
        localizacaoService.pararRastreamento(watchIdRef.current);
      }
    };
  }, [isCheckingAuth]);

  // Inicia rastreamento contínuo da localização
  const iniciarRastreamentoLocalizacao = () => {
    try {
      const watchId = localizacaoService.iniciarRastreamento(
        (coords) => {
          setAtualizandoLocalizacao(true);
          setLocalizacaoUsuario(coords);
          setPrecisaoLocalizacao(coords.precisao);
          setRastreamentoAtivo(true);
          setTimeout(() => setAtualizandoLocalizacao(false), 1000);
        },
        (error) => {
          setRastreamentoAtivo(false);
          setMensagemLocalizacao("Rastreamento interrompido: " + error.message);
        }
      );
      watchIdRef.current = watchId;
    } catch (error) {
      setMensagemLocalizacao("Erro ao iniciar rastreamento: " + error.message);
    }
  };

  // Reinicia o rastreamento da localização
  const reiniciarRastreamentoLocalizacao = async () => {
    try {
      setMensagemLocalizacao("🔄 Obtendo localização...");
      
      if (watchIdRef.current) {
        localizacaoService.pararRastreamento(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      const coords = await localizacaoService.solicitarLocalizacao();
      setLocalizacaoUsuario(coords);
      setPermissaoLocalizacao(true);
      
      if (coords.metodo === 'fallback') {
        setMensagemLocalizacao("📍 Localização padrão carregada. Permita o acesso à localização para melhor precisão.");
      } else {
        setMensagemLocalizacao("📍 Localização atualizada com sucesso!");
        iniciarRastreamentoLocalizacao();
      }
      
      setTimeout(() => setMensagemLocalizacao(""), 3000);
    } catch (error) {
      setPermissaoLocalizacao(false);
      setMensagemLocalizacao("❌ " + error.message);
    }
  };

  // Busca pinos após verificação de autenticação
  useEffect(() => {
    if (!isCheckingAuth) fetchPinos();
  }, [isCheckingAuth, fetchPinos]);

  // Handlers para operações com pinos
  const onSavePino = useCallback(
    (dados) => handleSavePino({ dados, addPino, setIsSidebarOpen, setTempPin, setSelectedPino }),
    [addPino]
  );

  const onUpdatePino = useCallback(
    (dados) => {
      if (selectedPino?._id) {
        handleUpdatePino({
          pinoId: selectedPino._id,
          dados,
          updatePino,
          setIsSidebarOpen,
          setSelectedPino,
        });
      }
    },
    [selectedPino, updatePino]
  );

  const onDeletePino = useCallback(
    (pinoId) => handleDeletePino({ pinoId, removePino, setIsSidebarOpen, setSelectedPino }),
    [removePino]
  );

  const onPinoClick = useCallback(
    (pino) => {
      if (isAdmin) {
        setSelectedPino(pino);
        setIsSidebarOpen(true);
        setTempPin(null);
      }
    },
    [isAdmin]
  );

  // Confirma atividade no pino (valida localização e marca tarefa)
  const confirmarAtividade = async (pino) => {
    const userData = authService.getUser();
    if (!userData?.id) {
      setMensagemLocalizacao("❌ Você precisa estar logado para confirmar atividades.");
      return;
    }

    // Verifica se tarefa já foi concluída
    if (isTarefaConcluida(pino._id)) {
      setMensagemLocalizacao("✅ Você já completou esta tarefa!");
      setTimeout(() => setMensagemLocalizacao(""), 3000);
      return;
    }

    // Verifica permissão de localização
    if (!permissaoLocalizacao) {
      setMensagemLocalizacao("Permissão de localização necessária para confirmar atividades.");
      return;
    }

    // Obtém localização atual se não disponível
    if (!localizacaoUsuario) {
      setMensagemLocalizacao("Obtendo localização atual...");
      try {
        const coords = await localizacaoService.solicitarLocalizacao();
        setLocalizacaoUsuario(coords);
      } catch (error) {
        setMensagemLocalizacao(error.message);
        return;
      }
    }

    // Evita múltiplos cliques
    if (validandoLocalizacao) return;

    setValidandoLocalizacao(true);
    setMensagemLocalizacao("Validando sua localização...");

    try {
      // Valida proximidade do usuário com o pino
      const validacao = await localizacaoService.validarProximidadePino(
        localizacaoUsuario.latitude,
        localizacaoUsuario.longitude,
        pino._id,
        50 // raio em metros
      );

      if (!validacao.valid) {
        setMensagemLocalizacao(`❌ Você está a ${validacao.distancia.metros}m do local. Aproxime-se!`);
        setValidandoLocalizacao(false);
        return;
      }

      setMensagemLocalizacao("✅ Localização validada! Concluindo tarefa...");

      // Marca tarefa como concluída
      const capibasRecompensa = Number(pino.capibas) || 0;
      
      if (isAdmin) {
        await adminService.concluirTarefa(userData.id, pino._id);
        setMensagemLocalizacao("✅ Tarefa testada com sucesso! (Modo Admin)");
      } else {
        await clienteService.concluirTarefa(userData.id, pino._id, capibasRecompensa);
        await atualizarDadosUsuario();
        setMensagemLocalizacao(`🎉 Parabéns! Você ganhou ${capibasRecompensa} capibas!`);
        setTarefasConcluidas(prev => new Set([...prev, pino._id]));
      }

      setTimeout(() => setMensagemLocalizacao(""), 5000);

    } catch (error) {
      console.error('Erro ao confirmar atividade:', error);
      
      if (error.message.includes("Tarefa já concluída")) {
        setMensagemLocalizacao("✅ Você já completou esta tarefa anteriormente!");
        setTarefasConcluidas(prev => new Set([...prev, pino._id]));
      } else {
        setMensagemLocalizacao(`❌ ${error.message || "Erro ao confirmar atividade. Tente novamente."}`);
      }
    } finally {
      setValidandoLocalizacao(false);
    }
  };

  // Filtra pinos com coordenadas válidas
  const pinosValidos = useMemo(
    () => pinos.filter((pino) => pino.localizacao?.coordinates?.length === 2),
    [pinos]
  );

  // Determina ícone da localização do usuário
  const getUserLocationIcon = () => {
    if (atualizandoLocalizacao) return createUserLocationUpdatingIcon();
    if (localizacaoUsuario?.metodo === 'fallback') return createUserLocationFallbackIcon();
    return createUserLocationIcon();
  };

  // Estados de loading
  if (isCheckingAuth || loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error && pinos.length === 0) {
    return (
      <div className="errorContainer">
        <h3>Erro ao carregar mapa</h3>
        <p>{error}</p>
        <button onClick={fetchPinos} className="retryButton">Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="mapa-container">
      {/* Status da localização */}
      <StatusLocalizacao 
        permissao={permissaoLocalizacao}
        mensagem={mensagemLocalizacao}
        isAdmin={isAdmin}
        rastreamentoAtivo={rastreamentoAtivo}
        precisao={precisaoLocalizacao}
        onReiniciar={reiniciarRastreamentoLocalizacao}
      />

      {/* Info de capibas e tarefas (apenas para clientes) */}
      {user && !isAdmin && (
        <div className="user-capibas-info">
          <div className="capibas-counter">
            <span className="capibas-icon">🦙</span>
            <span className="capibas-text">{user.capibas || 0} capibas</span>
          </div>
          <div className="tarefas-counter">
            <span className="tarefas-icon">✅</span>
            <span className="tarefas-text">{user.tarefasCompletas || 0} tarefas</span>
          </div>
        </div>
      )}

      {/* Mapa principal */}
      <div className="mapa-wrapper">
        <MapContainer
          scrollWheelZoom={false}
          className="espacoMapa"
          style={{ height: '100%', width: '100%' }}
          center={localizacaoUsuario ? [localizacaoUsuario.latitude, localizacaoUsuario.longitude] : MAP_CONFIG.center}
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

          {/* Marcador da localização do usuário */}
          {localizacaoUsuario && permissaoLocalizacao && (
            <Marker
              position={[localizacaoUsuario.latitude, localizacaoUsuario.longitude]}
              icon={getUserLocationIcon()}
            >
              <Popup>
                <div className="user-location-popup">
                  <strong>
                    {localizacaoUsuario.metodo === 'fallback' 
                      ? '📍 Localização Aproximada' 
                      : '📍 Sua Localização'}
                  </strong>
                  <p>
                    {localizacaoUsuario.metodo === 'fallback'
                      ? 'GPS não disponível. Ative a localização para melhor precisão.' 
                      : 'Você está aqui!'}
                  </p>
                  <small>
                    Lat: {localizacaoUsuario.latitude.toFixed(6)}<br/>
                    Lng: {localizacaoUsuario.longitude.toFixed(6)}
                  </small>
                  {localizacaoUsuario.precisao && (
                    <small>Precisão: ~{Math.round(localizacaoUsuario.precisao)} metros</small>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Handler de clique no mapa (apenas admin) */}
          {isAdmin && (
            <MapClickHandler
              setIsSidebarOpen={setIsSidebarOpen}
              setTempPin={setTempPin}
              setSelectedPino={setSelectedPino}
            />
          )}

          {/* Pino temporário (apenas admin) */}
          {tempPin && isAdmin && (
            <Marker position={[tempPin.lat, tempPin.lng]} icon={ICONS.temporary}>
              <Popup>
                <div className="popUpNovoPonto">
                  <strong>📍 Novo Ponto</strong>
                  <p>Preencha as informações na sidebar para salvar.</p>
                  <small>Lat: {tempPin.lat.toFixed(4)}<br/>Lng: {tempPin.lng.toFixed(4)}</small>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Pinos existentes no mapa */}
          {pinosValidos.map((pino) => (
            <Marker
              key={pino._id || pino.id}
              // ✅ CORRIGIDO: Leaflet usa [lat, lng] mas GeoJSON é [lng, lat] - invertemos a ordem
              position={[pino.localizacao.coordinates[1], pino.localizacao.coordinates[0]]}
              eventHandlers={{ click: () => onPinoClick(pino) }}
            >
              <Popup>
                <div className="modal">
                  <h3 className="mensagem">{pino.nome}</h3>

                  {/* Badge de tarefa concluída */}
                  {isTarefaConcluida(pino._id) && (
                    <div className="tarefa-concluida-badge">✅ Concluída</div>
                  )}

                  {/* Upload de foto */}
                  <label htmlFor={`foto-${pino._id || pino.id}`}>
                    <img
                      className="imagem"
                      src="/src/assets/AdicionarFoto.png"
                      alt="Adicionar Foto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.textContent = '📷 Adicionar Foto';
                        fallback.style.fontSize = '2rem';
                        e.target.parentNode.appendChild(fallback);
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Clique para adicionar foto</span>
                  </label>
                  <input
                    type="file"
                    id={`foto-${pino._id || pino.id}`}
                    accept="image/*"
                    title="Enviar Foto"
                    className="inputFoto"
                  />

                  {/* Descrição e recompensa */}
                  <p className="mensagem">{pino.msg}</p>
                  <p className="mensagem"><strong>Recompensa: {pino.capibas || 0} capibas</strong></p>

                  {/* Botão de confirmação */}
                  <button 
                    className={`botaoConfirmar ${validandoLocalizacao ? 'loading' : ''} ${isTarefaConcluida(pino._id) ? 'concluida' : ''}`}
                    onClick={() => confirmarAtividade(pino)}
                    disabled={validandoLocalizacao || !permissaoLocalizacao || isTarefaConcluida(pino._id)}
                  >
                    {validandoLocalizacao ? '⏳ Validando...' :
                     !permissaoLocalizacao ? '📍 Permitir Localização' :
                     isTarefaConcluida(pino._id) ? '✅ Já Concluída' :
                     '✅ Confirmar Presença'}
                  </button>

                  {/* Mensagens de status */}
                  {mensagemLocalizacao && (
                    <div className={`mensagem-status ${mensagemLocalizacao.includes('❌') ? 'erro' : mensagemLocalizacao.includes('✅') ? 'sucesso' : 'info'}`}>
                      {mensagemLocalizacao}
                    </div>
                  )}

                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Sidebar (apenas para admin) */}
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
          onUpdate={onUpdatePino}
          onDelete={onDeletePino}
          user={user}
        />
      )}
    </div>
  );
}