import "../../css/mapa.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";

// Importações
import { handleSavePino, handleDeletePino, handleUpdatePino } from "./acoesPinos.js";
import { MAP_CONFIG, ICONS } from "./constantesMapa.js";
import usePinosManagement from "./usePinosManagement.js";
import MapClickHandler from "./MapClickHandler.jsx";
import Sidebar from "../barra-lateral/barra-lateral.jsx";

import { authService } from "../../services/authService.js";
import StatusLocalizacao from "./StatusLocalizacao.jsx";
import { localizacaoService } from "../../services/localizacaoService.js";
import { clienteService } from "../../services/clienteService.js";
import { adminService } from "../../services/adminService.js";

// =================================================================
// Configuração do Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// =================================================================
// Ícones personalizados para localização do usuário
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

const createUserLocationFallbackIcon = () => {
  return L.divIcon({
    className: 'user-location-marker fallback',
    html: `
      <div class="user-location-pulse" style="border-color: #fdcb6e;">
        <div class="user-location-dot" style="background: #fdcb6e;"></div>
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

  // Estados para localização em tempo real
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [permissaoLocalizacao, setPermissaoLocalizacao] = useState(null);
  const [validandoLocalizacao, setValidandoLocalizacao] = useState(false);
  const [mensagemLocalizacao, setMensagemLocalizacao] = useState("");
  const [rastreamentoAtivo, setRastreamentoAtivo] = useState(false);
  const [precisaoLocalizacao, setPrecisaoLocalizacao] = useState(null);
  const [atualizandoLocalizacao, setAtualizandoLocalizacao] = useState(false);

  // ✅ NOVO ESTADO: Para controlar tarefas já concluídas
  const [tarefasConcluidas, setTarefasConcluidas] = useState(new Set());

  const watchIdRef = useRef(null);

  const { pinos, loading, error, fetchPinos, addPino, removePino, updatePino } = usePinosManagement();

  // Efeito pra verificar autenticação
  useEffect(() => {
    const checkAuth = () => {
      const userData = authService.getUser();
      if (userData) {
        setUser(userData);
        setIsAdmin(authService.isAdmin());
        
        // ✅ CARREGAR TAREFAS CONCLUÍDAS DO USUÁRIO
        if (userData.tarefasConcluidas) {
          setTarefasConcluidas(new Set(userData.tarefasConcluidas));
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // ✅ NOVA FUNÇÃO: Atualizar dados do usuário
  const atualizarDadosUsuario = useCallback(async () => {
    try {
      const userData = authService.getUser();
      if (userData && userData.id) {
        console.log('🔄 Atualizando dados do usuário...');
        
        const usuarioAtualizado = await clienteService.getCliente(userData.id);
        
        if (usuarioAtualizado.user) {
          // ✅ ATUALIZAR ESTADO LOCAL
          setUser(usuarioAtualizado.user);
          
          // ✅ ATUALIZAR TAREFAS CONCLUÍDAS
          if (usuarioAtualizado.user.tarefasConcluidas) {
            setTarefasConcluidas(new Set(usuarioAtualizado.user.tarefasConcluidas));
          }
          
          // ✅ ATUALIZAR NO LOCALSTORAGE (opcional)
          authService.updateUserData(usuarioAtualizado.user);
          
          console.log('✅ Dados do usuário atualizados:', {
            capibas: usuarioAtualizado.user.capibas,
            tarefasConcluidas: usuarioAtualizado.user.tarefasConcluidas?.length
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar dados do usuário:', error);
    }
  }, []);

  // ✅ NOVA FUNÇÃO: Verificar se tarefa já foi concluída
  const isTarefaConcluida = useCallback((pinoId) => {
    return tarefasConcluidas.has(pinoId);
  }, [tarefasConcluidas]);

  // Efeito para solicitar permissão de localização
  useEffect(() => {
    const solicitarPermissaoLocalizacao = async () => {
      try {
        setMensagemLocalizacao("📍 Obtendo sua localização...");
        
        const coords = await localizacaoService.solicitarLocalizacao();
        setLocalizacaoUsuario(coords);
        setPermissaoLocalizacao(true);
        setMensagemLocalizacao("");
        
        console.log('📍 Localização do usuário obtida:', coords);
        
        if (coords.metodo !== 'fallback') {
          iniciarRastreamentoLocalizacao();
        } else {
          setMensagemLocalizacao("📍 Usando localização padrão. Ative o GPS para melhor precisão.");
          setTimeout(() => setMensagemLocalizacao(""), 5000);
        }
        
      } catch (error) {
        console.warn('⚠️ Erro ao obter localização:', error.message);
        setPermissaoLocalizacao(false);
        
        if (error.message.includes("negada")) {
          setMensagemLocalizacao("📍 Permissão necessária. Clique em 'Atualizar' quando permitir.");
        } else {
          setMensagemLocalizacao("📍 Não foi possível obter localização. Clique em 'Atualizar' para tentar novamente.");
        }
        
        // Fallback para localização padrão
        console.log('📍 Usando localização padrão (Recife)...');
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
      console.log('🎯 Iniciando solicitação de localização para usuário...', { 
        isAdmin, 
        user: user?.name || 'Não logado' 
      });
      solicitarPermissaoLocalizacao();
    }

    return () => {
      if (watchIdRef.current) {
        localizacaoService.pararRastreamento(watchIdRef.current);
      }
    };
  }, [isCheckingAuth]);

  /**
   * INICIA RASTREAMENTO CONTÍNUO DA LOCALIZAÇÃO
   */
  const iniciarRastreamentoLocalizacao = () => {
    console.log('📍 Iniciando rastreamento de localização...');
    
    try {
      const watchId = localizacaoService.iniciarRastreamento(
        (coords) => {
          setAtualizandoLocalizacao(true);
          setLocalizacaoUsuario(coords);
          setPrecisaoLocalizacao(coords.precisao);
          setRastreamentoAtivo(true);
          
          console.log('📍 Localização atualizada:', coords);
          
          setTimeout(() => {
            setAtualizandoLocalizacao(false);
          }, 1000);
        },
        (error) => {
          console.error('❌ Erro no rastreamento:', error);
          setRastreamentoAtivo(false);
          setMensagemLocalizacao("Rastreamento interrompido: " + error.message);
        }
      );
      
      if (watchId) {
        watchIdRef.current = watchId;
        console.log('✅ Rastreamento iniciado com sucesso');
      } else {
        console.warn('⚠️ Não foi possível iniciar o rastreamento');
        setMensagemLocalizacao("Não foi possível iniciar o rastreamento contínuo");
      }
      
    } catch (error) {
      console.error('❌ Erro ao tentar iniciar rastreamento:', error);
      setMensagemLocalizacao("Erro ao iniciar rastreamento: " + error.message);
    }
  };

  /**
   * REINICIA O RASTREAMENTO DA LOCALIZAÇÃO
   */
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
      
      setTimeout(() => {
        setMensagemLocalizacao("");
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erro ao reiniciar localização:', error);
      setPermissaoLocalizacao(false);
      setMensagemLocalizacao("❌ " + error.message);
    }
  };

  // Efeito pra buscar os pinos
  useEffect(() => {
    if (!isCheckingAuth) {
      fetchPinos();
    }
  }, [isCheckingAuth, fetchPinos]);

  // Função que salva um pino
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

  // Função que deleta um pino
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
      if (isAdmin) {
        setSelectedPino(pino);
        setIsSidebarOpen(true);
        setTempPin(null);
      }
    },
    [isAdmin]
  );

  /**
   * FUNÇÃO PARA CONFIRMAR ATIVIDADE NO PINO - CORRIGIDA
   * Valida localização e marca tarefa como concluída
   */
  const confirmarAtividade = async (pino) => {
    // Verifica se o usuário está logado
    const userData = authService.getUser();
    if (!userData || !userData.id) {
      setMensagemLocalizacao("❌ Você precisa estar logado para confirmar atividades.");
      return;
    }

    // ✅ VERIFICA SE TAREFA JÁ FOI CONCLUÍDA
    if (isTarefaConcluida(pino._id)) {
      setMensagemLocalizacao("✅ Você já completou esta tarefa!");
      setTimeout(() => setMensagemLocalizacao(""), 3000);
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

    // Evita múltiplos cliques
    if (validandoLocalizacao) {
      return;
    }

    setValidandoLocalizacao(true);
    setMensagemLocalizacao("Validando sua localização...");

    try {
      console.log('📍 Iniciando validação de proximidade...', {
        usuario: { lat: localizacaoUsuario.latitude, lng: localizacaoUsuario.longitude },
        pino: {
          id: pino._id,
          nome: pino.nome,
          coords: pino.localizacao?.coordinates
        },
        raio: 50
      });

      // VALIDAÇÃO DE LOCALIZAÇÃO
      const validacao = await localizacaoService.validarProximidadePino(
        localizacaoUsuario.latitude,
        localizacaoUsuario.longitude,
        pino._id,
        50
      );

      console.log('✅ Resposta da validação:', validacao);

      if (!validacao.valid) {
        setMensagemLocalizacao(`❌ Você está a ${validacao.distancia.metros}m do local. Aproxime-se!`);
        setValidandoLocalizacao(false);
        return;
      }

      // SE ESTIVER PRÓXIMO, MARCA A TAREFA COMO CONCLUÍDA
      setMensagemLocalizacao("✅ Localização validada! Concluindo tarefa...");

      let resultado;

      if (isAdmin) {
        console.log('👑 Admin testando tarefa...');
        resultado = await adminService.concluirTarefa(userData.id, pino._id);
        setMensagemLocalizacao("✅ Tarefa testada com sucesso! (Modo Admin)");
      } else {
        console.log('👤 Cliente concluindo tarefa...');
        
        // ✅ CORREÇÃO: Garantir que capibas seja número
        const capibasRecompensa = Number(pino.capibas) || 0;
        
        resultado = await clienteService.concluirTarefa(
          userData.id,
          pino._id,
          capibasRecompensa
        );
        
        // ✅ CORREÇÃO CRÍTICA: ATUALIZAR DADOS DO USUÁRIO IMEDIATAMENTE
        await atualizarDadosUsuario();
        
        // ✅ MOSTRAR CAPIBAS ATUALIZADOS
        const capibasAtuais = user?.capibas || resultado.capibas || 0;
        setMensagemLocalizacao(`🎉 Parabéns! Você ganhou ${capibasRecompensa} capibas! Total: ${capibasAtuais} capibas`);
        
        // ✅ ADICIONAR TAREFA À LISTA DE CONCLUÍDAS
        setTarefasConcluidas(prev => new Set([...prev, pino._id]));
      }

      console.log('✅ Tarefa concluída com sucesso:', resultado);

      // Feedback visual adicional
      setTimeout(() => {
        setMensagemLocalizacao("");
      }, 5000);

    } catch (error) {
      console.error('❌ Erro ao confirmar atividade:', error);
      
      // Mensagens de erro específicas
      if (error.message.includes("Tarefa já concluída")) {
        setMensagemLocalizacao("✅ Você já completou esta tarefa anteriormente!");
        // ✅ MARCAR COMO CONCLUÍDA MESMO NO ERRO (para evitar novas tentativas)
        setTarefasConcluidas(prev => new Set([...prev, pino._id]));
      } else if (error.message.includes("muito longe")) {
        setMensagemLocalizacao(error.message);
      } else if (error.message.includes("Erro interno do servidor")) {
        setMensagemLocalizacao("🔧 Serviço temporariamente indisponível. Tente novamente em alguns minutos.");
      } else if (error.message.includes("Não autorizado")) {
        setMensagemLocalizacao("🔒 Sessão expirada. Faça login novamente.");
      } else if (error.message.includes("Sem resposta")) {
        setMensagemLocalizacao("🌐 Problema de conexão. Verifique sua internet.");
      } else if (error.message.includes("Pino não encontrado")) {
        setMensagemLocalizacao("📍 Ponto não encontrado no sistema.");
      } else {
        setMensagemLocalizacao(`❌ ${error.message || "Erro ao confirmar atividade. Tente novamente."}`);
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

  // Determina qual ícone usar baseado no estado da localização
  const getUserLocationIcon = () => {
    if (atualizandoLocalizacao) {
      return createUserLocationUpdatingIcon();
    }
    if (localizacaoUsuario?.metodo === 'fallback') {
      return createUserLocationFallbackIcon();
    }
    return createUserLocationIcon();
  };

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

      {/* ✅ MOSTRAR CAPIBAS ATUAIS DO USUÁRIO (se estiver logado) */}
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

      {/* Container do mapa */}
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
                  {localizacaoUsuario.metodo === 'fallback' && (
                    <div style={{marginTop: '8px', padding: '5px', background: '#fff3cd', borderRadius: '4px'}}>
                      <small>⚠️ Localização padrão</small>
                    </div>
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

          {/* Pinos existentes */}
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

                  {/* ✅ BADGE DE TAREFA CONCLUÍDA */}
                  {isTarefaConcluida(pino._id) && (
                    <div className="tarefa-concluida-badge">
                      ✅ Concluída
                    </div>
                  )}

                  {/* Upload da foto */}
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

                  {/* Descrição da atividade e recompensa */}
                  <p className="mensagem">{pino.msg}</p>
                  <p className="mensagem">
                    <strong>Recompensa: {pino.capibas || 0} capibas</strong>
                  </p>

                  {/* BOTÃO DE CONFIRMAÇÃO - ATUALIZADO */}
                  <button 
                    className={`botaoConfirmar ${validandoLocalizacao ? 'loading' : ''} ${isTarefaConcluida(pino._id) ? 'concluida' : ''}`}
                    onClick={() => confirmarAtividade(pino)}
                    disabled={validandoLocalizacao || !permissaoLocalizacao || isTarefaConcluida(pino._id)}
                  >
                    {validandoLocalizacao ? (
                      <>⏳ Validando...</>
                    ) : !permissaoLocalizacao ? (
                      <>📍 Permitir Localização</>
                    ) : isTarefaConcluida(pino._id) ? (
                      <>✅ Já Concluída</>
                    ) : (
                      <>✅ Confirmar Presença</>
                    )}
                  </button>

                  {/* Mensagens de status da localização */}
                  {mensagemLocalizacao && (
                    <div className={`mensagem-status ${mensagemLocalizacao.includes('❌') ? 'erro' : mensagemLocalizacao.includes('✅') ? 'sucesso' : 'info'}`}>
                      {mensagemLocalizacao}
                    </div>
                  )}

                  {/* Aviso para admin */}
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