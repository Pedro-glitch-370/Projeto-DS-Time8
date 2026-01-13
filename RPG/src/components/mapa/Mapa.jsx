import "./mapa.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { useEffect, useState, useCallback, useRef } from "react";

// Serviços e componentes
import { handleSavePino, handleDeletePino, handleUpdatePino } from "./acoesPinos.js";
import { MAP_CONFIG, ICONS } from "./constantes/constantesMapa.js";
import { createUserLocationIcon, createUserLocationUpdatingIcon, createUserLocationFallbackIcon } from "./constantes/iconsLeaflet.js";
import Loading from "../loading/Loading.jsx";
import usePinosManagement from "./usePinosManagement.js";
import MapClickHandler from "./MapClickHandler.jsx";
import Sidebar from "../barra-lateral/barraLateral.jsx";
import StatusLocalizacao from "./StatusLocalizacao.jsx";
import { authService } from "../../services/authService.js";
import { localizacaoService } from "../../services/localizacaoService.js";
import { clienteService } from "../../services/clienteService.js";
import { adminService } from "../../services/adminService.js";
import { temporadaService } from "../../services/temporadaService.js"

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
  const [mensagemLocalizacao, setMensagemLocalizacao] = useState({});
  const [rastreamentoAtivo, setRastreamentoAtivo] = useState(false);
  const [precisaoLocalizacao, setPrecisaoLocalizacao] = useState(null);
  const [atualizandoLocalizacao, setAtualizandoLocalizacao] = useState(false);
  
  // Estado de tarefas concluídas
  const [temporadaAtual, setTemporadaAtual] = useState(null);
  const [tarefasConcluidas, setTarefasConcluidas] = useState(new Map());
  const [presencasConfirmadas, setPresencasConfirmadas] = useState({});
  const atualizarPresencaDoPino = (pinoId, valor) => {
    setPresencasConfirmadas(prev => ({ ...prev, [pinoId]: valor }));
  };

  const watchIdRef = useRef(null);
  const { pinos, loading, error, fetchPinos, addPino, removePino, updatePino } = usePinosManagement();

  // Funções com conteúdos próprios de cada pino
  const atualizarMensagemLocalizacao = (pinoId, msg) => {
    setMensagemLocalizacao(prev => ({ ...prev, [pinoId]: msg }));
  };

  // Verifica autenticação ao carregar
  useEffect(() => {
    const checkAuth = () => {
      console.log("🔍 Verificando autenticação...");
      const userData = authService.getUser();
      
      if (userData) {
        setUser(userData);
        const adminStatus = authService.isAdmin();
        console.log("👑 É admin?", adminStatus);
        setIsAdmin(adminStatus);
        
        // Carrega tarefas concluídas do usuário
        if (userData.tarefasConcluidas) {
          const tarefasMap = new Map();
          userData.tarefasConcluidas.forEach(id => {
            tarefasMap.set(id, true);
          });
          console.log("✅ Tarefas concluídas carregadas:", tarefasMap.size);
          setTarefasConcluidas(tarefasMap);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setTarefasConcluidas(new Map());
      }
      setIsCheckingAuth(false);
    };

    // Primeira execução
    checkAuth();

    // Escuta mudanças no usuário
    window.addEventListener("userChanged", checkAuth);

    // Limpa o listener ao desmontar
    return () => window.removeEventListener("userChanged", checkAuth);
  }, []);

  useEffect(() => {
    const carregarTemporadaAtual = async () => {
      try {
        const atual = await temporadaService.getTemporadaAtual();
        setTemporadaAtual(atual && atual.pinIds ? atual : null);
      } catch (error) {
        console.error("Erro ao carregar temporada atual:", error);
      }
    };
    carregarTemporadaAtual();
  }, []);

  // Atualiza dados do usuário (capibas e tarefas)
  const atualizarDadosUsuario = useCallback(async () => {
    try {
      const userData = authService.getUser();
      if (userData?.id) {
        console.log("🔄 Atualizando dados do usuário:", userData.id);
        const usuarioAtualizado = await clienteService.getCliente(userData.id);

        if (usuarioAtualizado.user) {
          setUser(usuarioAtualizado.user);
          
          // Atualiza tarefas concluídas
          if (usuarioAtualizado.user.tarefasConcluidas) {
            const novasTarefas = new Map();
            usuarioAtualizado.user.tarefasConcluidas.forEach(id => {
              novasTarefas.set(id, true);
            });
            console.log("🆕 Atualizando tarefas concluídas:", novasTarefas.size);
            setTarefasConcluidas(novasTarefas);
          }
          
          authService.setUser(usuarioAtualizado.user);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  }, []);

  // Função para marcar tarefa como concluída
  const marcarTarefaComoConcluida = useCallback((pinoId) => {
    console.log(`📝 Marcando tarefa ${pinoId} como concluída`);
    setTarefasConcluidas(prev => {
      const novoMap = new Map(prev);
      novoMap.set(pinoId, true);
      return novoMap;
    });
  }, []);

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
      } catch (error) { // eslint-disable-line no-unused-vars
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
    if (!isCheckingAuth) {
      console.log("🗺️ Buscando pinos do mapa...");
      fetchPinos();
    }
  }, [isCheckingAuth, fetchPinos]);

  // Função auxiliar para os handlers
  const atualizarTemporadaAtual = async () => {
    const temporada = await temporadaService.getTemporadaAtual();
    setTemporadaAtual(temporada);
  };

  // Handlers para operações com pinos
  const onSavePino = useCallback(
    async (dados) => {
      await handleSavePino({ dados, addPino, setIsSidebarOpen, setTempPin, setSelectedPino });
      await atualizarTemporadaAtual();
    },
    [addPino]
  );

  const onUpdatePino = useCallback(
    async (dados) => {
      if (selectedPino?._id) {
        handleUpdatePino({
          pinoId: selectedPino._id,
          dados,
          updatePino,
          setIsSidebarOpen,
          setSelectedPino,
        });
        await atualizarTemporadaAtual();
      }
    },
    [selectedPino, updatePino]
  );

  const onDeletePino = useCallback(
    async (pinoId) => {
      await handleDeletePino({ pinoId, removePino, setIsSidebarOpen, setSelectedPino });
      await atualizarTemporadaAtual();
    },
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

  // Componente interno para os campos de foto e descrição
  const PinoPopupContent = ({ pino, pinoId, tarefaConcluida, presencaConfirmada, setPresencaConfirmada }) => {
    // Estados locais para os campos de formulário
    const [fotoLink, setFotoLink] = useState('');
    const [descricaoConclusao, setDescricaoConclusao] = useState('');
    const [validandoLocalizacao, setValidandoLocalizacao] = useState(false);

    // Função para validar a presença/localização
    const validarPresenca = async (pino) => {
      const pinoId = pino._id;
      setValidandoLocalizacao(true);
      atualizarMensagemLocalizacao(pinoId, "Validando sua localização...");

      try {
        const validacao = await localizacaoService.validarProximidadePino(
          localizacaoUsuario.latitude,
          localizacaoUsuario.longitude,
          pinoId,
          50
        );

        if (!validacao.valid) {
          atualizarMensagemLocalizacao(pinoId, `❌ Você está a ${validacao.distancia.metros}m do local. Aproxime-se!`);
          setValidandoLocalizacao(false);
          return;
        }

        atualizarMensagemLocalizacao(pinoId,"✅ Localização validada! Preencha os dados para concluir.");
        setPresencaConfirmada(true);
      } catch (error) {
        atualizarMensagemLocalizacao(pinoId,`❌ ${error.message || "Erro ao validar presença"}`);
      } finally {
        setValidandoLocalizacao(false);
      }
    };

    // Função para confirmar atividade
    const confirmarAtividade = async (
      pino,
      fotoLink = '',
      descricaoConclusao = ''
    ) => {
      const pinoId = pino._id;

      // Se já está concluída, não faz nada
      if (tarefasConcluidas.has(pinoId)) {
        const mensagem = isAdmin ? "✅ Tarefa já testada!" : "✅ Tarefa já concluída!";
        setMensagemLocalizacao(mensagem);
        setTimeout(() => setMensagemLocalizacao(""), 3000);
        return;
      }

      const userData = authService.getUser();
      if (!userData?.id) {
        setMensagemLocalizacao("❌ Você precisa estar logado para confirmar atividades.");
        return;
      }

      if (!permissaoLocalizacao) {
        setMensagemLocalizacao("📍 Permissão de localização necessária para confirmar atividades.");
        return;
      }

      let coordsParaValidar = localizacaoUsuario;
      if (!coordsParaValidar) {
        setMensagemLocalizacao("Obtendo localização atual...");
        try {
          coordsParaValidar = await localizacaoService.solicitarLocalizacao();
          setLocalizacaoUsuario(coordsParaValidar);
        } catch (error) {
          setMensagemLocalizacao(error.message);
          return;
        }
      }

      if (validandoLocalizacao) return;

      setValidandoLocalizacao(true);
      setMensagemLocalizacao("Validando sua localização...");

      try {
        const capibasRecompensa = Number(pino.capibas) || 0;

        if (isAdmin) {
          try {
            await adminService.concluirTarefa(userData.id, pinoId, capibasRecompensa);
            setMensagemLocalizacao("✅ Tarefa testada com sucesso!");
            marcarTarefaComoConcluida(pinoId);
          } catch (adminError) {
            if (adminError.message.includes("Tarefa já testada")) {
              setMensagemLocalizacao("✅ Tarefa já foi testada anteriormente");
              marcarTarefaComoConcluida(pinoId);
            } else {
              setMensagemLocalizacao(`❌ ${adminError.message || "Erro ao testar tarefa"}`);
            }
          }
        } else {
          // Valida campos obrigatórios
          if (!fotoLink.trim() || !descricaoConclusao.trim()) {
            setMensagemLocalizacao("❌ Preencha o link e o relatório antes de confirmar.");
            setValidandoLocalizacao(false);
            return;
          }

          try {
            await clienteService.concluirTarefa(
              userData.id,
              pinoId,
              capibasRecompensa,
              fotoLink,
              descricaoConclusao
            );

            await atualizarDadosUsuario();
            setMensagemLocalizacao(`🎉 Parabéns! Você ganhou ${capibasRecompensa} capibas!`);
            marcarTarefaComoConcluida(pinoId);
          } catch (clienteError) {
            if (clienteError.message.includes("Tarefa já concluída")) {
              setMensagemLocalizacao("✅ Você já completou esta tarefa anteriormente!");
              marcarTarefaComoConcluida(pinoId);
              setTimeout(() => atualizarDadosUsuario(), 1000);
            } else {
              setMensagemLocalizacao(`❌ ${clienteError.message || "Erro ao concluir tarefa"}`);
            }
          }
        }

        setTimeout(() => setMensagemLocalizacao(""), 2000);

      } catch (error) {
        console.error("Erro ao confirmar atividade:", error);
        if (error.message.includes("Tarefa já concluída")) {
          setMensagemLocalizacao("✅ Você já completou esta tarefa anteriormente!");
          marcarTarefaComoConcluida(pinoId);
        } else {
          setMensagemLocalizacao(`❌ ${error.message || "Erro ao confirmar atividade. Tente novamente."}`);
        }
      } finally {
        setValidandoLocalizacao(false);
      }
    };

    const mensagem = mensagemLocalizacao[pinoId] || '';

    return (
      <div className="modal"> 
        <h3 className="mensagem-modal">{pino.nome}</h3>

        {/* Descrição e recompensa */}
        {!tarefaConcluida && !presencaConfirmada && (
          <div>
          <p className="mensagem-modal">{pino.msg}</p>
          <p className="mensagem-modal"><strong>Recompensa: {pino.capibas || 0} capibas</strong></p>
          </div>
          )}

        {/* Novos campos - Apenas quando não é admin e tarefa não concluída */}
        {!isAdmin && !tarefaConcluida && presencaConfirmada && (
          <div className="novos-campos">
            <div className="campo-form">
              <label htmlFor={`foto-link-${pinoId}`}>Link da Foto (Instagram/Facebook)</label>
              <input
                type="url"
                id={`foto-link-${pinoId}`}
                placeholder="https://instagram.com/p/..."
                value={fotoLink}
                onChange={(e) => setFotoLink(e.target.value)}
                className="campo-input"
              />
            </div>

            <div className="campo-form">
              <label htmlFor={`descricao-${pinoId}`}>O que você fez?</label>
              <textarea
                id={`descricao-${pinoId}`}
                placeholder="Descreva como completou a missão..."
                value={descricaoConclusao}
                onChange={(e) => setDescricaoConclusao(e.target.value)}
                className="campo-textarea"
                rows="3"
              />
            </div>
          </div>
        )}

        {/* Feedback visual para tarefa concluída */}
        {tarefaConcluida && (
          <div className="tarefa-concluida-badge">
            <div className="badge-icon">
              {isAdmin ? '🧪' : '🏆'}
            </div>
            <div className="badge-text">
              {isAdmin ? 'Tarefa já testada' : 'Tarefa já concluída'}
            </div>
            {!isAdmin && pino.capibas > 0 && (
              <div className="badge-subtext">
                +{pino.capibas} capibas recebidos
              </div>
            )}
          </div>
        )}

        {/* Botão de confirmação */}
        <button 
          className={`botaoConfirmar ${validandoLocalizacao ? 'loading' : ''} ${tarefaConcluida ? 'concluida' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!tarefaConcluida) {
              if (!presencaConfirmada) {
                // Primeiro clique só valida presença
                validarPresenca(pino);
              } else {
                // Segundo clique envia os dados e conclui
                confirmarAtividade(pino, fotoLink, descricaoConclusao);
              }
            }
          }}
          disabled={validandoLocalizacao || !permissaoLocalizacao || tarefaConcluida}
        >
          {validandoLocalizacao ? '⏳ Processando...' :
          !permissaoLocalizacao ? '📍 Permitir Localização' :
          tarefaConcluida ? 
            (isAdmin ? '✅ Tarefa Testada' : '✅ Tarefa Completada') :
            (presencaConfirmada ? 
              isAdmin ? '🧪 Testar Tarefa' : '✅ Concluir Tarefa'
              : '🎯 Confirmar Presença'
            )}
        </button>

        {/* Mensagens de status temporárias */}
        {mensagem && !tarefaConcluida && (
          <div className={`mensagem-status ${mensagem.includes('❌') ? 'erro' : mensagem.includes('✅') ? 'sucesso' : 'info'}`}>
            {mensagem}
          </div>
        )}
      </div>
    );
  };

  // Determina ícone da localização do usuário
  const getUserLocationIcon = () => {
    if (atualizandoLocalizacao) return createUserLocationUpdatingIcon();
    if (localizacaoUsuario?.metodo === 'fallback') return createUserLocationFallbackIcon();
    return createUserLocationIcon();
  };

  // Estados de loading
  if (isCheckingAuth || loading) {
    return <Loading />;
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
        isAdmin={isAdmin}
        rastreamentoAtivo={rastreamentoAtivo}
        precisao={precisaoLocalizacao}
        onReiniciar={reiniciarRastreamentoLocalizacao}
      />

      {!temporadaAtual && (
        <div className="sem-temporada-overlay">
          🚫 Nenhuma temporada ativa no momento
        </div>
      )}
      
      {temporadaAtual && temporadaAtual.pinIds.length === 0 && (
        <div className="sem-temporada-overlay">
          🚫 Nenhuma tarefa disponível no momento
        </div>
      )}

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
                   <div>
                    <small>Precisão: ~{Math.round(localizacaoUsuario.precisao)} metros</small>
                   </div>
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
          {temporadaAtual && temporadaAtual.pinIds
          .filter(pino => pino.localizacao?.coordinates?.length === 2)
          .map((pino) => {
            const pinoId = pino._id;
            const concluidoPorAlguem = Array.isArray(pino.conclusoes) && pino.conclusoes.length > 0;
            const concluidoPorUsuario = tarefasConcluidas.has(pino._id);
            const tarefaConcluida = concluidoPorUsuario || concluidoPorAlguem;
            
            return (
              <Marker
                key={pinoId || pino.id}
                position={[pino.localizacao.coordinates[1], pino.localizacao.coordinates[0]]}
                eventHandlers={{ click: () => onPinoClick(pino) }}
              >
                <Popup>
                    <PinoPopupContent 
                      pino={pino} 
                      pinoId={pinoId} 
                      tarefaConcluida={tarefaConcluida}
                      presencaConfirmada={presencasConfirmadas[pinoId] || false}
                      setPresencaConfirmada={(v) => atualizarPresencaDoPino(pinoId, v)}
                    />
                </Popup>
              </Marker>
            );
          })}
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