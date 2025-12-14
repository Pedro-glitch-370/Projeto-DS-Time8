import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Temporadas.css";
import { temporadaService } from "../../../services/temporadaService";
import { pinoService } from "../../../services/pinoService";

export default function Temporadas() {
  const navigate = useNavigate();
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [temporadas, setTemporadas] = useState([]);
  const [pinos, setPinos] = useState([]);
  const [form, setForm] = useState({
    titulo: "",
    dataInicio: "",
    dataFim: "",
    status: "agendado",
    pinIds: []
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [carregandoPinos, setCarregandoPinos] = useState(false);
  const [mostrarNavegacao, setMostrarNavegacao] = useState(false);
  
  // Refs para as seções da página e controle de scroll
  const formularioRef = useRef(null);
  const listaRef = useRef(null);
  const topoRef = useRef(null);
  const gridRef = useRef(null);
  
  // Estados para controle do scroll horizontal
  const [scrollAtivo, setScrollAtivo] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [cardsVisiveis, setCardsVisiveis] = useState(3);
  
  console.log("🚀 Componente Temporadas MONTADO");
  console.log("📊 Estado inicial - pinos:", pinos);
  console.log("📊 Estado inicial - carregandoPinos:", carregandoPinos);
  
  // Verificar autenticação
  useEffect(() => {
    console.log("🔐 useEffect - Verificando autenticação");
    const verificarAutenticacao = () => {
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        console.warn("⚠️ Nenhum usuário encontrado no localStorage");
        alert('⚠️ Você precisa estar logado para acessar esta página!');
        navigate('/');
        return false;
      }
      
      try {
        const user = JSON.parse(userData);
        console.log("👤 Usuário logado:", user);
        setUsuarioLogado(user);
        
        if (user.tipo !== 'admin') {
          console.warn("❌ Usuário não é admin. Tipo:", user.tipo);
          alert('❌ Apenas administradores podem acessar as configurações de temporadas!');
          navigate('/');
          return false;
        }
        
        console.log("✅ Usuário é admin, pode continuar");
        return true;
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        localStorage.removeItem('user');
        navigate('/');
        return false;
      }
    };
    
    if (verificarAutenticacao()) {
      console.log("✅ Autenticação OK, carregando dados...");
      carregarDados();
    }
  }, [navigate]);

  // Mostrar navegação quando scroll > 300px
  useEffect(() => {
    const handleScroll = () => {
      setMostrarNavegacao(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Configurar scroll horizontal
  useEffect(() => {
    if (gridRef.current && temporadas.length > 0) {
      setTotalCards(temporadas.length);
      
      const updateCardsVisiveis = () => {
        if (gridRef.current) {
          const cardWidth = window.innerWidth < 768 ? 320 : 380;
          const visiveis = Math.floor(gridRef.current.clientWidth / cardWidth);
          setCardsVisiveis(Math.max(1, visiveis));
        }
      };
      
      const updateScrollAtivo = () => {
        if (gridRef.current) {
          const cardWidth = window.innerWidth < 768 ? 320 : 380;
          const scrollLeft = gridRef.current.scrollLeft;
          const novoAtivo = Math.floor(scrollLeft / cardWidth);
          setScrollAtivo(Math.min(novoAtivo, temporadas.length - cardsVisiveis));
        }
      };
      
      // Atualizar inicialmente
      updateCardsVisiveis();
      updateScrollAtivo();
      
      // Adicionar event listeners
      gridRef.current.addEventListener('scroll', updateScrollAtivo);
      window.addEventListener('resize', updateCardsVisiveis);
      
      // Cleanup
      return () => {
        if (gridRef.current) {
          gridRef.current.removeEventListener('scroll', updateScrollAtivo);
        }
        window.removeEventListener('resize', updateCardsVisiveis);
      };
    }
  }, [temporadas.length, cardsVisiveis]);

  const carregarDados = async () => {
    console.log("🔄 INICIANDO carregarDados()");
    console.log("📊 Estado usuarioLogado:", usuarioLogado);
    
    if (!usuarioLogado) {
      console.warn("⚠️ usuarioLogado é null, abortando carregarDados");
      return;
    }
    
    setLoading(true);
    setErro("");
    setCarregandoPinos(true);
    
    try {
      // Carregar temporadas
      console.log("📋 1. Carregando temporadas...");
      const temporadasData = await temporadaService.getTemporadas();
      console.log("✅ Temporadas carregadas:", temporadasData);
      console.log("✅ Tipo:", typeof temporadasData);
      console.log("✅ É array?", Array.isArray(temporadasData));
      console.log("✅ Quantidade:", temporadasData?.length || 0);
      setTemporadas(temporadasData);
      
      // Carregar pinos - COM TRATAMENTO DE ERRO MELHORADO
      console.log("📍 2. Carregando pinos...");
      try {
        console.log("📍 Chamando pinoService.getPinos()...");
        const pinosData = await pinoService.getPinos();
        console.log("📍 Dados brutos retornados de pinoService.getPinos():", pinosData);
        console.log("📍 Tipo dos dados:", typeof pinosData);
        console.log("📍 É array?", Array.isArray(pinosData));
        
        if (pinosData) {
          console.log("📍 Propriedades do objeto:", Object.keys(pinosData));
        }
        
        // Verificar se os dados dos pinos estão no formato correto
        if (Array.isArray(pinosData)) {
          console.log("✅ Dados são um array!");
          console.log("✅ Tamanho do array:", pinosData.length);
          
          if (pinosData.length > 0) {
            console.log("📍 Primeiro elemento do array:", pinosData[0]);
            console.log("📍 Propriedades do primeiro elemento:", Object.keys(pinosData[0]));
          }
          
          // Garantir que cada pino tenha _id, nome e capibas
          const pinosFormatados = pinosData.map((pino, index) => {
            console.log(`📍 Processando pino ${index}:`, pino);
            
            const pinoFormatado = {
              _id: pino._id || pino.id || `pino-${Date.now()}-${index}`,
              nome: pino.nome || 'Pino sem nome',
              capibas: typeof pino.capibas === 'number' ? pino.capibas : parseInt(pino.capibas) || 0
            };
            
            console.log(`📍 Pino ${index} formatado:`, pinoFormatado);
            return pinoFormatado;
          });
          
          console.log("✅ Pinos formatados para exibição:", pinosFormatados);
          console.log("✅ Quantidade de pinos formatados:", pinosFormatados.length);
          setPinos(pinosFormatados);
        } else {
          console.warn("⚠️ Dados de pinos NÃO são um array:", pinosData);
          console.warn("⚠️ Tipo:", typeof pinosData);
          
          // Tentar extrair array de objeto
          if (pinosData && typeof pinosData === 'object') {
            console.log("📍 Tentando encontrar array dentro do objeto...");
            Object.keys(pinosData).forEach(key => {
              console.log(`📍 Chave "${key}":`, pinosData[key], "É array?", Array.isArray(pinosData[key]));
            });
            
            // Procurar por propriedade que seja array
            const arrayKey = Object.keys(pinosData).find(key => Array.isArray(pinosData[key]));
            if (arrayKey) {
              console.log(`✅ Encontrado array na chave "${arrayKey}"`);
              const arrayData = pinosData[arrayKey];
              const pinosFormatados = arrayData.map((pino, index) => ({
                _id: pino._id || pino.id || `pino-${Date.now()}-${index}`,
                nome: pino.nome || 'Pino sem nome',
                capibas: typeof pino.capibas === 'number' ? pino.capibas : parseInt(pino.capibas) || 0
              }));
              setPinos(pinosFormatados);
              return;
            }
          }
          
          setPinos([]);
          setErro("⚠️ Formato inválido de dados dos pinos.");
        }
        
      } catch (pinoError) {
        console.error('❌ ERRO ao carregar pinos da API:', pinoError);
        console.error('❌ Mensagem do erro:', pinoError.message);
        console.error('❌ Stack trace:', pinoError.stack);
        
        if (pinoError.response) {
          console.error('❌ Resposta da API:', {
            status: pinoError.response.status,
            statusText: pinoError.response.statusText,
            data: pinoError.response.data,
            headers: pinoError.response.headers
          });
        }
        
        // Usar dados de exemplo apenas se não houver dados da API
        console.log("🔄 Usando dados de exemplo para pinos...");
        const pinosExemplo = [
          { _id: "p1", nome: "Pino Central", capibas: 50 },
          { _id: "p2", nome: "Pino Norte", capibas: 30 },
          { _id: "p3", nome: "Pino Sul", capibas: 40 },
          { _id: "p4", nome: "Pino Leste", capibas: 25 },
          { _id: "p5", nome: "Pino Oeste", capibas: 35 }
        ];
        console.log("✅ Dados de exemplo:", pinosExemplo);
        setPinos(pinosExemplo);
        setErro("⚠️ Usando dados de exemplo para pinos. API pode estar offline.");
      }
      
    } catch (error) {
      console.error("❌ ERRO GERAL ao carregar dados:", error);
      console.error("❌ Mensagem:", error.message);
      console.error("❌ Stack:", error.stack);
      
      if (error.response?.status === 401) {
        console.error("❌ Erro 401 - Não autorizado");
        localStorage.removeItem('user');
        navigate('/');
        return;
      }
      
      setErro("Erro ao carregar dados. Tente novamente.");
    } finally {
      console.log("🏁 FINALIZANDO carregarDados()");
      console.log("📊 Estado final - pinos:", pinos);
      console.log("📊 Estado final - pinos length:", pinos.length);
      console.log("📊 Estado final - carregandoPinos:", carregandoPinos);
      setLoading(false);
      setCarregandoPinos(false);
    }
  };

  const criarTemporada = async (e) => {
    e.preventDefault();
    
    if (!usuarioLogado || usuarioLogado.tipo !== 'admin') {
      alert('❌ Apenas administradores podem criar temporadas!');
      return;
    }
    
    setErro("");
    
    const erros = temporadaService.validarTemporada(form);
    if (erros.length > 0) {
      setErro(erros.join(", "));
      return;
    }
    
    setLoading(true);
    
    try {
      const dadosFormatados = temporadaService.formatarDadosParaAPI(form);
      await temporadaService.criarTemporada(dadosFormatados);
      
      setForm({
        titulo: "",
        dataInicio: "",
        dataFim: "",
        status: "agendado",
        pinIds: []
      });
      
      await carregarDados();
      
      alert("✅ Temporada criada com sucesso!");
      
      // Rolar para a lista após criar
      scrollParaLista();
      
    } catch (error) {
      console.error("Erro ao criar temporada:", error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        navigate('/');
        return;
      }
      
      setErro(error.response?.data?.message || "Erro ao criar temporada.");
    } finally {
      setLoading(false);
    }
  };

  const atualizarTemporada = async (id, dados) => {
    if (!usuarioLogado || usuarioLogado.tipo !== 'admin') {
      alert('❌ Apenas administradores podem atualizar temporadas!');
      return;
    }
    
    if (!window.confirm("Tem certeza que deseja atualizar esta temporada?")) return;
    
    try {
      await temporadaService.atualizarTemporada(id, dados);
      await carregarDados();
      alert("✅ Temporada atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar temporada:", error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        navigate('/');
        return;
      }
      
      alert("❌ Erro ao atualizar temporada.");
    }
  };

  const deletarTemporada = async (id) => {
    if (!usuarioLogado || usuarioLogado.tipo !== 'admin') {
      alert('❌ Apenas administradores podem deletar temporadas!');
      return;
    }
    
    if (!window.confirm("Tem certeza que deseja deletar esta temporada?")) return;
    
    try {
      await temporadaService.deletarTemporada(id);
      await carregarDados();
      alert("✅ Temporada deletada com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar temporada:", error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        navigate('/');
        return;
      }
      
      alert("❌ Erro ao deletar temporada.");
    }
  };

  // Funções de navegação por scroll
  const scrollParaTopo = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollParaFormulario = () => {
    formularioRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const scrollParaLista = () => {
    listaRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Funções para controle do scroll horizontal
  const scrollParaEsquerda = () => {
    if (gridRef.current) {
      const cardWidth = window.innerWidth < 768 ? 320 : 380;
      gridRef.current.scrollBy({
        left: -cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollParaDireita = () => {
    if (gridRef.current) {
      const cardWidth = window.innerWidth < 768 ? 320 : 380;
      gridRef.current.scrollBy({
        left: cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollParaCard = (index) => {
    if (gridRef.current) {
      const cardWidth = window.innerWidth < 768 ? 320 : 380;
      gridRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  // Renderização condicional
  if (!usuarioLogado) {
    return (
      <div className="temporadas-content">
        <div className="loading-container">
          <div className="spinner"></div>
          <h3>Verificando permissões...</h3>
        </div>
      </div>
    );
  }

  if (usuarioLogado.tipo !== 'admin') {
    return (
      <div className="temporadas-content">
        <div className="acesso-negado">
          <h2>🚫 Acesso Negado</h2>
          <p>Apenas administradores podem acessar esta página.</p>
          <button onClick={() => navigate('/')}>Voltar</button>
        </div>
      </div>
    );
  }

  if (loading && temporadas.length === 0) {
    return (
      <div className="temporadas-content">
        <div className="loading-container">
          <div className="spinner"></div>
          <h3>Carregando...</h3>
        </div>
      </div>
    );
  }

  console.log("🎨 RENDERIZANDO componente");
  console.log("📊 Estado atual - pinos:", pinos);
  console.log("📊 Estado atual - pinos length:", pinos.length);
  console.log("📊 Estado atual - carregandoPinos:", carregandoPinos);
  console.log("📊 Estado atual - temporadas:", temporadas.length);

  return (
    <div className="temporadas-content">
      {/* Referência para o topo */}
      <div ref={topoRef} />
      
      {/* Botões de navegação flutuantes */}
      {mostrarNavegacao && (
        <div className="navegacao-flutuante">
          <button 
            onClick={scrollParaTopo} 
            className="nav-btn topo"
            title="Ir para o topo"
          >
            🔼
          </button>
          <button 
            onClick={scrollParaFormulario} 
            className="nav-btn formulario"
            title="Ir para o formulário"
          >
            📝
          </button>
          <button 
            onClick={scrollParaLista} 
            className="nav-btn lista"
            title="Ir para a lista"
          >
            📋
          </button>
        </div>
      )}

      <div className="temporadas-header">
        <h2>🎯 Configurar Temporada</h2>
        <div className="header-info">
          <p className="admin-info">
            👤 <strong>{usuarioLogado.nome}</strong> (Administrador)
          </p>
        </div>
      </div>
      
      {erro && (
        <div className={`mensagem ${erro.includes('exemplo') ? 'alerta' : 'erro'}`}>
          {erro}
        </div>
      )}
      
      {/* Formulário de criação */}
      <div ref={formularioRef} className="form-container">
        <form onSubmit={criarTemporada} className="temporada-form">
          <div className="form-header">
            <h3>➕ Criar Nova Temporada</h3>
            <button 
              type="button" 
              onClick={scrollParaLista}
              className="btn-ir-lista"
              title="Ir para lista de temporadas"
            >
              📋 Ver Lista
            </button>
          </div>
          
          <div className="form-body">
            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                placeholder="Ex: Temporada de Verão 2024"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Data de Início *</label>
                <input
                  type="date"
                  value={form.dataInicio}
                  onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Data de Fim *</label>
                  <input
                    type="date"
                    value={form.dataFim}
                    onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
                    required
                    disabled={loading}
                  />
              </div>
            </div>
            
            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                disabled={loading}
              >
                <option value="agendado">⏳ Agendado</option>
                <option value="ativo">✅ Ativo</option>
                <option value="encerrado">❌ Encerrado</option>
              </select>
            </div>
            
            <div className="form-group">
              <div className="select-header">
                <label>Pinos (opcional)</label>
                <span className="pinos-contador">
                  {carregandoPinos ? "Carregando..." : `${pinos.length} disponíveis`}
                </span>
              </div>
              
              {pinos.length > 0 ? (
                <>
                  <select
                    multiple
                    value={form.pinIds}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pinIds: Array.from(e.target.selectedOptions, (opt) => opt.value)
                      })
                    }
                    disabled={loading || carregandoPinos}
                    size="5"
                    className="select-pinos"
                  >
                    {pinos.map((p, index) => {
                      console.log(`🎯 Renderizando option para pino ${index}:`, p);
                      return (
                        <option key={p._id} value={p._id}>
                          📍 {p.nome} - {p.capibas} capibas
                        </option>
                      );
                    })}
                  </select>
                  <div className="select-footer">
                    <small>Selecione múltiplos com Ctrl (Windows) ou Cmd (Mac)</small>
                    <span className="selecionados">{form.pinIds.length} selecionado(s)</span>
                  </div>
                </>
              ) : (
                <div className="sem-pinos">
                  <p>⚠️ Nenhum pino disponível no momento.</p>
                  <small>
                    {carregandoPinos 
                      ? "Carregando pinos..." 
                      : "Adicione pinos primeiro na página do mapa."}
                  </small>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-footer">
            <button type="submit" disabled={loading || carregandoPinos} className="btn-primario">
              {loading ? (
                <>
                  <span className="spinner-btn"></span>
                  Criando...
                </>
              ) : (
                "Criar Temporada"
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Lista de temporadas com scroll lateral */}
      <div ref={listaRef} className="temporadas-lista">
        <div className="lista-header">
          <div className="lista-titulo">
            <h3>📋 Temporadas Existentes</h3>
            <button 
              onClick={scrollParaFormulario}
              className="btn-nova-temporada"
              title="Criar nova temporada"
            >
              ➕ Nova Temporada
            </button>
          </div>
          <span className="contador">{temporadas.length} temporada(s)</span>
        </div>
        
        {temporadas.length === 0 ? (
          <div className="sem-dados">
            <div className="icone-vazio">📭</div>
            <h4>Nenhuma temporada cadastrada</h4>
            <p>Crie sua primeira temporada usando o formulário acima</p>
            <button 
              onClick={scrollParaFormulario}
              className="btn-criar-primeira"
            >
              ➕ Criar Primeira Temporada
            </button>
          </div>
        ) : (
          <div className="temporadas-grid-container">
            {/* Indicador de scroll horizontal */}
            {temporadas.length > cardsVisiveis && (
              <div className="scroll-horizontal-indicator">
                <span>↔️</span>
                <span>Arraste para os lados para ver mais temporadas</span>
                <span>↔️</span>
              </div>
            )}
            
            {/* Container com scroll horizontal */}
            <div className="temporadas-grid-wrapper">
              <div 
                ref={gridRef} 
                className="temporadas-grid"
              >
                {temporadas.map((temporada, index) => {
                  const temporadaFormatada = temporadaService.formatarParaExibicao(temporada);
                  const statusInfo = temporadaService.getStatusFormatado(temporada.status);
                  
                  return (
                    <div key={temporada._id} className="temporada-card">
                      <div className="card-header">
                        <div className="temporada-titulo">
                          <h4>{temporada.titulo}</h4>
                          <span className="status-badge" style={{ backgroundColor: statusInfo.cor }}>
                            {statusInfo.texto}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="info-item">
                          <span className="info-label">📅 Período:</span>
                          <span className="info-value">{temporadaFormatada.dataInicioFormatada} - {temporadaFormatada.dataFimFormatada}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">⏱️ Duração:</span>
                          <span className="info-value">{temporadaFormatada.duracao}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">📍 Pinos:</span>
                          <span className="info-value">{temporada.pinIds?.length || 0} pino(s)</span>
                        </div>
                      </div>
                      
                      <div className="card-footer">
                        <div className="card-actions">
                          {temporada.status !== 'ativo' && (
                            <button 
                              onClick={() => atualizarTemporada(temporada._id, { status: 'ativo' })}
                              className="btn-sucesso"
                              title="Ativar temporada"
                              disabled={loading}
                            >
                              <span className="icone">✅</span>
                              <span className="texto">Ativar</span>
                            </button>
                          )}
                          
                          {temporada.status === 'ativo' && (
                            <button 
                              onClick={() => atualizarTemporada(temporada._id, { status: 'encerrado' })}
                              className="btn-alerta"
                              title="Encerrar temporada"
                              disabled={loading}
                            >
                              <span className="icone">⏹️</span>
                              <span className="texto">Encerrar</span>
                            </button>
                          )}
                          
                          <button 
                            onClick={() => deletarTemporada(temporada._id)}
                            className="btn-perigo"
                            title="Deletar temporada"
                            disabled={loading}
                          >
                            <span className="icone">🗑️</span>
                            <span className="texto">Deletar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Controles de navegação horizontal */}
            {temporadas.length > cardsVisiveis && (
              <div className="controles-scroll-horizontal">
                <button 
                  onClick={scrollParaEsquerda}
                  disabled={scrollAtivo === 0}
                  title="Anterior"
                >
                  ◀️
                </button>
                
                <div className="indicador-scroll">
                  {Array.from({ length: Math.min(totalCards, 8) }).map((_, i) => (
                    <div 
                      key={i}
                      className={`ponto-scroll ${i === scrollAtivo ? 'ativo' : ''}`}
                      onClick={() => scrollParaCard(i)}
                      title={`Ir para temporada ${i + 1}`}
                    />
                  ))}
                  {totalCards > 8 && (
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      ...+{totalCards - 8}
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={scrollParaDireita}
                  disabled={scrollAtivo >= totalCards - cardsVisiveis}
                  title="Próximo"
                >
                  ▶️
                </button>
              </div>
            )}
          
          </div>
        )}
      </div>
    </div>
  );
}