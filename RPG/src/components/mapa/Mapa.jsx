import "../../css/mapa.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";

// No topo do Mapa.jsx, adicione:
import { handleSavePino, handleDeletePino, handleUpdatePino } from "./acoesPinos.js";
import { MAP_CONFIG, ICONS } from "./constantesMapa.js";
import usePinosManagement from "./usePinosManagement.js";
import MapClickHandler from "./MapClickHandler.jsx";
import Sidebar from "../barra-lateral/barra-lateral.jsx";
import { authService } from "../../services/authService.js";
import StatusLocalizacao from "./StatusLocalizacao.jsx";
import { localizacaoService } from "../../services/localizacaoService.js";
import { clienteService } from "../../services/clienteService.js";

// =================================================================
// Pra evitar problemas de caminho
delete L.Icon.Default.prototype._getIconUrl;

// URLs corretas dos ícones dos pinos
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// =================================================================
// ÍCONE PERSONALIZADO PARA A LOCALIZAÇÃO DO USUÁRIO
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="user-location-pulse">
        <div class="user-location-dot"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Ícone para quando a localização está sendo atualizada
const createUserLocationUpdatingIcon = () => {
  return L.divIcon({
    className: 'user-location-marker updating',
    html: `
      <div class="user-location-pulse updating">
        <div class="user-location-dot updating"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// =================================================================
// Componente principal
export default function Mapa() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tempPin, setTempPin] = useState(null);
  const [selectedPino, setSelectedPino] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // NOVOS ESTADOS PARA LOCALIZAÇÃO EM TEMPO REAL
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [permissaoLocalizacao, setPermissaoLocalizacao] = useState(null);
  const [validandoLocalizacao, setValidandoLocalizacao] = useState(false);
  const [mensagemLocalizacao, setMensagemLocalizacao] = useState("");
  const [rastreamentoAtivo, setRastreamentoAtivo] = useState(false);
  const [precisaoLocalizacao, setPrecisaoLocalizacao] = useState(null);
  const [atualizandoLocalizacao, setAtualizandoLocalizacao] = useState(false);

  const watchIdRef = useRef(null); // Ref para armazenar o ID do rastreamento

  const { pinos, loading, error, fetchPinos, addPino, removePino, updatePino } = usePinosManagement();

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

  // Efeito para solicitar permissão de localização quando o componente montar
  useEffect(() => {
    const solicitarPermissaoLocalizacao = async () => {
      try {
        setMensagemLocalizacao("Solicitando permissão de localização...");
        
        const coords = await localizacaoService.solicitarLocalizacao();
        setLocalizacaoUsuario(coords);
        setPermissaoLocalizacao(true);
        setMensagemLocalizacao("");
        
        console.log('📍 Localização do usuário obtida:', coords);
        
        // INICIAR RASTREAMENTO CONTÍNUO
        iniciarRastreamentoLocalizacao();
        
      } catch (error) {
        setPermissaoLocalizacao(false);
        setMensagemLocalizacao(error.message);
        console.warn('⚠️ Permissão de localização negada:', error.message);
      }
    };

    // Só solicita se for usuário comum (não admin)
    if (!isAdmin && !isCheckingAuth) {
      solicitarPermissaoLocalizacao();
    }

    // Cleanup: parar rastreamento quando o componente desmontar
    return () => {
      if (watchIdRef.current) {
        localizacaoService.pararRastreamento(watchIdRef.current);
      }
    };
  }, [isAdmin, isCheckingAuth]);

  /**
   * INICIA RASTREAMENTO CONTÍNUO DA LOCALIZAÇÃO
   */
  const iniciarRastreamentoLocalizacao = () => {
    console.log('📍 Iniciando rastreamento de localização...');
    
    const watchId = localizacaoService.iniciarRastreamento(
      // Callback de sucesso - quando a localização é atualizada
      (coords) => {
        setAtualizandoLocalizacao(true);
        setLocalizacaoUsuario(coords);
        setPrecisaoLocalizacao(coords.precisao);
        setRastreamentoAtivo(true);
        
        console.log('📍 Localização atualizada:', coords);
        
        // Remove o estado de atualização após um breve delay
        setTimeout(() => {
          setAtualizandoLocalizacao(false);
        }, 1000);
      },
      // Callback de erro
      (error) => {
        console.error('❌ Erro no rastreamento:', error);
        setRastreamentoAtivo(false);
        setMensagemLocalizacao(error.message);
      }
    );
    
    watchIdRef.current = watchId;
  };

  /**
   * PARA O RASTREAMENTO DA LOCALIZAÇÃO
   */
  const pararRastreamentoLocalizacao = () => {
    if (watchIdRef.current) {
      localizacaoService.pararRastreamento(watchIdRef.current);
      watchIdRef.current = null;
      setRastreamentoAtivo(false);
      setMensagemLocalizacao("Rastreamento de localização parado");
    }
  };

  /**
   * REINICIA O RASTREAMENTO DA LOCALIZAÇÃO
   */
  const reiniciarRastreamentoLocalizacao = async () => {
    try {
      setMensagemLocalizacao("Reiniciando localização...");
      
      // Para o rastreamento atual se existir
      if (watchIdRef.current) {
        localizacaoService.pararRastreamento(watchIdRef.current);
      }
      
      // Solicita nova permissão
      const coords = await localizacaoService.solicitarLocalizacao();
      setLocalizacaoUsuario(coords);
      setPermissaoLocalizacao(true);
      setMensagemLocalizacao("");
      
      // Reinicia o rastreamento
      iniciarRastreamentoLocalizacao();
      
    } catch (error) {
      setPermissaoLocalizacao(false);
      setMensagemLocalizacao(error.message);
    }
  };

  // ... (resto das funções existentes: onSavePino, onUpdatePino, onDeletePino, onPinoClick, confirmarAtividade)

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

  // Função que atualiza um pino existente
  const onUpdatePino = useCallback(
  (dados) => {
    if (selectedPino && selectedPino._id) {
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
    (pino) => {
      // Se for admin, abre a sidebar em modo edição
      if (isAdmin) {
        setSelectedPino(pino);
        setIsSidebarOpen(true);
        setTempPin(null);
      }
      // Se não for admin, só mostra o popup normal
    },
    [isAdmin]
  );

  /**
   * FUNÇÃO PARA CONFIRMAR ATIVIDADE NO PINO
   * Valida localização e marca tarefa como concluída
   */
  const confirmarAtividade = async (pino) => {
    // Verifica se o usuário está logado
    const userData = authService.getUser();
    if (!userData || !userData.id) {
      setMensagemLocalizacao("❌ Você precisa estar logado para confirmar atividades.");
      return;
    }

    // Verifica se o usuário permitiu localização
    if (!permissaoLocalizacao) {
      setMensagemLocalizacao("Permissão de localização necessária para confirmar atividades.");
      return;
    }

    // Verifica se temos localização atual
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

    setValidandoLocalizacao(true);
    setMensagemLocalizacao("Validando sua localização...");

    try {
      // 1. VALIDA SE O USUÁRIO ESTÁ PRÓXIMO DO PINO
      const validacao = await localizacaoService.validarProximidadePino(
        localizacaoUsuario.latitude,
        localizacaoUsuario.longitude,
        pino._id,
        50 // Raio de 50 metros
      );

      if (!validacao.valid) {
        setMensagemLocalizacao(`❌ Você está muito longe! Aproxime-se do local. (Distância: ${validacao.distancia.metros}m)`);
        setValidandoLocalizacao(false);
        return;
      }

      // 2. SE ESTIVER PRÓXIMO, MARCA A TAREFA COMO CONCLUÍDA
      setMensagemLocalizacao("✅ Localização validada! Concluindo tarefa...");

      const resultado = await clienteService.concluirTarefa(
        userData.id,
        pino._id,
        pino.capibas || 0
      );

      // 3. SUCESSO - MOSTRA FEEDBACK POSITIVO
      setMensagemLocalizacao(`🎉 Parabéns! Você ganhou ${pino.capibas} capibas!`);
      
      // Feedback visual adicional
      setTimeout(() => {
        setMensagemLocalizacao("");
      }, 5000);

      console.log('✅ Tarefa concluída com sucesso:', resultado);

    } catch (error) {
      console.error('❌ Erro ao confirmar atividade:', error);
      
      // Mensagens de erro específicas
      if (error.message.includes("Tarefa já concluída")) {
        setMensagemLocalizacao("✅ Você já completou esta tarefa!");
      } else if (error.message.includes("muito longe")) {
        setMensagemLocalizacao(error.message);
      } else {
        setMensagemLocalizacao("❌ Erro ao confirmar atividade. Tente novamente.");
      }
    } finally {
      setValidandoLocalizacao(false);
    }
  };

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
      {/* Status da localização */}
      <StatusLocalizacao 
        permissao={permissaoLocalizacao}
        mensagem={mensagemLocalizacao}
        isAdmin={isAdmin}
        rastreamentoAtivo={rastreamentoAtivo}
        precisao={precisaoLocalizacao}
        onReiniciar={reiniciarRastreamentoLocalizacao}
      />

      {/* Container do mapa - CORRIGIDO: sem margin-top, altura calculada */}
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

          {/* MARCADOR DA LOCALIZAÇÃO DO USUÁRIO */}
          {localizacaoUsuario && permissaoLocalizacao && (
            <Marker
              position={[localizacaoUsuario.latitude, localizacaoUsuario.longitude]}
              icon={atualizandoLocalizacao ? createUserLocationUpdatingIcon() : createUserLocationIcon()}
            >
              <Popup>
                <div className="user-location-popup">
                  <strong>📍 Sua Localização</strong>
                  <p>Você está aqui!</p>
                  {precisaoLocalizacao && (
                    <small>Precisão: ~{Math.round(precisaoLocalizacao)} metros</small>
                  )}
                  <div className="location-status">
                    {rastreamentoAtivo ? (
                      <span className="status-active">● Ativo</span>
                    ) : (
                      <span className="status-inactive">● Inativo</span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

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
                <strong>📍 Novo Ponto</strong>
                <p>Preencha as informações na sidebar para salvar.</p>
                <small>Lat: {tempPin.lat.toFixed(4)}<br/>Lng: {tempPin.lng.toFixed(4)}</small>
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
                  <label htmlFor={`foto-${pino._id || pino.id}`}>
                    <img
                      className="imagem"
                      src="/src/assets/AdicionarFoto.png"
                      alt="Adicionar Foto"
                      onError={(e) => {
                        // Fallback se a imagem não carregar
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

                  {/* Descrição da atividade e recompensa */}
                  <p className="mensagem">{pino.msg}</p>
                  <p className="mensagem">
                    <strong>Recompensa: {pino.capibas || 0} capibas</strong>
                  </p>

                  {/* BOTÃO DE CONFIRMAÇÃO - AGORA COM VALIDAÇÃO */}
                  <button 
                    className={`botaoConfirmar ${validandoLocalizacao ? 'loading' : ''}`}
                    onClick={() => confirmarAtividade(pino)}
                    disabled={validandoLocalizacao || !permissaoLocalizacao}
                  >
                    {validandoLocalizacao ? (
                      <>⏳ Validando...</>
                    ) : !permissaoLocalizacao ? (
                      <>📍 Permitir Localização</>
                    ) : (
                      <>✅ Confirmar Presença</>
                    )}
                  </button>

                  {/* Mensagens de status da localização */}
                  {mensagemLocalizacao && (
                    <div className={`mensagem-status ${mensagemLocalizacao.includes('❌') ? 'erro' : 'sucesso'}`}>
                      {mensagemLocalizacao}
                    </div>
                  )}

                  {/* Aviso para admin - apenas informativo */}
                  {isAdmin && (
                    <div className="admin-hint">
                      💡 Admin: Clique fora do popup para editar este pino
                    </div>
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
          onUpdate={onUpdatePino}
          onDelete={onDeletePino}
          user={user}
        />
      )}
    </div>
  );
}