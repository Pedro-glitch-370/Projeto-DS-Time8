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

  // 1. PRIMEIRO useEffect: Verifica autenticação e define usuarioLogado
  useEffect(() => {
    console.log("🔐 PRIMEIRO useEffect - Verificando autenticação");
    
    const verificarEConfigurarUsuario = () => {
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        console.warn("⚠️ Nenhum usuário encontrado no localStorage");
        alert('⚠️ Você precisa estar logado para acessar esta página!');
        navigate('/');
        return null;
      }
      
      try {
        const user = JSON.parse(userData);
        console.log("👤 Usuário logado encontrado:", user);
        
        if (user.tipo !== 'admin') {
          console.warn("❌ Usuário não é admin. Tipo:", user.tipo);
          alert('❌ Apenas administradores podem acessar as configurações de temporadas!');
          navigate('/');
          return null;
        }
        
        console.log("✅ Usuário é admin, retornando usuário");
        return user;
        
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        localStorage.removeItem('user');
        navigate('/');
        return null;
      }
    };
    
    const usuario = verificarEConfigurarUsuario();
    if (usuario) {
      console.log("✅ Configurando usuarioLogado no estado");
      setUsuarioLogado(usuario);
    }
    
  }, [navigate]);

  // 2. SEGUNDO useEffect: Carrega dados quando usuarioLogado é definido
  useEffect(() => {
    console.log("🔄 SEGUNDO useEffect - Verificando se pode carregar dados");
    console.log("📊 usuarioLogado atual:", usuarioLogado);
    
    if (usuarioLogado) {
      console.log("✅ usuarioLogado definido, iniciando carregamento...");
      carregarDados();
    } else {
      console.log("⏳ Aguardando usuarioLogado ser definido...");
    }
  }, [usuarioLogado]); // Executa quando usuarioLogado muda

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
    console.log("🔄 INICIANDO carregarDados() - COM USUÁRIO DEFINIDO");
    console.log("📊 usuarioLogado no carregarDados:", usuarioLogado);
    
    if (!usuarioLogado) {
      console.error("❌ ERRO: carregarDados chamado sem usuarioLogado!");
      return;
    }
    
    setLoading(true);
    setErro("");
    setCarregandoPinos(true);
    
    try {
      // Carregar temporadas
      console.log("📋 1. Carregando temporadas...");
      const temporadasData = await temporadaService.getTemporadas();
      console.log("✅ Temporadas carregadas, quantidade:", temporadasData?.length || 0);
      setTemporadas(temporadasData || []);
      
      // Carregar pinos - VERSÃO SIMPLIFICADA
      console.log("📍 2. Carregando pinos...");
      
      // PRIMEIRO: Testar com dados de exemplo IMEDIATAMENTE
      console.log("📍 Definindo dados de exemplo para testar visualização...");
      const pinosExemploImediato = [
        { _id: "teste1", nome: "Pino Teste A", capibas: 100 },
        { _id: "teste2", nome: "Pino Teste B", capibas: 200 },
        { _id: "teste3", nome: "Pino Teste C", capibas: 300 },
        { _id: "teste4", nome: "Pino Teste D", capibas: 400 },
        { _id: "teste5", nome: "Pino Teste E", capibas: 500 }
      ];
      setPinos(pinosExemploImediato);
      console.log("📍 Dados de exemplo definidos:", pinosExemploImediato.length);
      
      // DEPOIS: Tentar carregar da API
      setTimeout(async () => {
        try {
          console.log("📍 Tentando carregar pinos da API...");
          const pinosData = await pinoService.getPinos();
          console.log("📍 Resposta da API:", pinosData);
          
          if (pinosData && Array.isArray(pinosData) && pinosData.length > 0) {
            console.log("✅ API retornou", pinosData.length, "pinos");
            
            const pinosFormatados = pinosData.map((pino, index) => ({
              _id: pino._id || pino.id || `pino-api-${index}`,
              nome: pino.nome || `Pino API ${index + 1}`,
              capibas: pino.capibas || 0
            }));
            
            console.log("📍 Atualizando com dados da API...");
            setPinos(pinosFormatados);
            setErro("✅ Pinos carregados da API");
            
          } else if (pinosData && typeof pinosData === 'object') {
            // Tentar encontrar array dentro do objeto
            const arrayKey = Object.keys(pinosData).find(key => Array.isArray(pinosData[key]));
            if (arrayKey) {
              const arrayData = pinosData[arrayKey];
              const pinosFormatados = arrayData.map((pino, index) => ({
                _id: pino._id || pino.id || `pino-${arrayKey}-${index}`,
                nome: pino.nome || `Pino ${index + 1}`,
                capibas: pino.capibas || 0
              }));
              
              console.log(`✅ Pinos encontrados na chave "${arrayKey}"`);
              setPinos(pinosFormatados);
              setErro(`✅ Pinos carregados (${arrayKey})`);
            }
          }
          
        } catch (pinoError) {
          console.warn("⚠️ Erro ao carregar pinos da API, mantendo dados de exemplo:", pinoError.message);
          // Mantém os dados de exemplo já definidos
        }
      }, 500);
      
    } catch (error) {
      console.error("❌ Erro geral ao carregar dados:", error);
      setErro("Erro ao carregar dados: " + error.message);
    } finally {
      console.log("🏁 Finalizando carregamento");
      setTimeout(() => {
        setLoading(false);
        setCarregandoPinos(false);
      }, 1000);
    }
  };

  // Função auxiliar para recarregar pinos manualmente
  const recarregarPinos = async () => {
    console.log("🔧 Recarregando pinos manualmente...");
    setCarregandoPinos(true);
    
    try {
      const pinosData = await pinoService.getPinos();
      console.log("🔧 Dados recebidos:", pinosData);
      
      if (pinosData && Array.isArray(pinosData)) {
        const novosPinos = pinosData.map((p, i) => ({
          _id: p._id || p.id || `manual-${i}`,
          nome: p.nome || `Pino Manual ${i + 1}`,
          capibas: p.capibas || 0
        }));
        
        setPinos(novosPinos);
        setErro(`✅ ${novosPinos.length} pinos carregados manualmente`);
      } else {
        setErro("⚠️ Formato inválido de pinos");
      }
    } catch (error) {
      console.error("🔧 Erro:", error);
      setErro("Erro ao recarregar: " + error.message);
    } finally {
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
    console.log("⏳ Render: Aguardando usuarioLogado...");
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

  console.log("🎨 RENDERIZANDO componente FINAL");
  console.log("📊 usuarioLogado:", usuarioLogado?.nome);
  console.log("📊 pinos length:", pinos.length);
  console.log("📊 temporadas length:", temporadas.length);

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

      {/* BOTÃO DE DEBUG VISUAL */}
      <div 
        style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          background: '#3498db',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000,
          fontSize: '14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
        onClick={recarregarPinos}
        title="Testar carregamento de pinos"
      >
        🔧 Testar Pinos
      </div>

      <div className="temporadas-header">
        <h2>🎯 Configurar Temporada</h2>
        <div className="header-info">
          <p className="admin-info">
            👤 <strong>{usuarioLogado.nome}</strong> (Administrador)
          </p>
          <button 
            onClick={carregarDados}
            className="btn-recargar"
            disabled={loading}
          >
            {loading ? '🔄...' : '🔄 Recarregar'}
          </button>
        </div>
      </div>
      
      {/* ÁREA DE DEBUG VISUAL */}
      <div style={{
        background: '#f8f9fa',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '15px',
        border: '1px solid #dee2e6',
        fontSize: '14px'
      }}>
        <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
          <div>
            <strong>📊 Status:</strong>
            <span style={{color: pinos.length > 0 ? '#2ecc71' : '#e74c3c', marginLeft: '10px'}}>
              {pinos.length > 0 ? `✅ ${pinos.length} pinos carregados` : '❌ Nenhum pino'}
            </span>
          </div>
          <div>
            <strong>👤 Usuário:</strong> 
            <span style={{marginLeft: '10px'}}>{usuarioLogado.nome}</span>
          </div>
          <button 
            onClick={() => console.log('DEBUG completo:', { pinos, temporadas, usuarioLogado })}
            style={{
              background: 'transparent',
              border: '1px solid #3498db',
              color: '#3498db',
              padding: '5px 10px',
              borderRadius: '3px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Console Log
          </button>
        </div>
      </div>
      
      {erro && (
        <div className={`mensagem ${erro.includes('✅') ? 'alerta' : 'erro'}`}>
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
              
              {/* VERIFICAÇÃO VISUAL DOS PINOS */}
              <div style={{
                marginBottom: '10px',
                padding: '8px',
                background: '#e8f4fd',
                borderRadius: '4px',
                border: '1px solid #b3d7ff',
                fontSize: '13px'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span><strong>🔍 Debug:</strong> {pinos.length} pinos encontrados</span>
                  {pinos.length > 0 && (
                    <span style={{color: '#2ecc71'}}>
                      ✅ Primeiro: {pinos[0].nome}
                    </span>
                  )}
                </div>
              </div>
              
              {pinos.length > 0 ? (
                <>
                  <select
                    multiple
                    value={form.pinIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                      console.log("🎯 Pinos selecionados:", selected);
                      setForm({ ...form, pinIds: selected });
                    }}
                    disabled={loading || carregandoPinos}
                    size="5"
                    className="select-pinos"
                    style={{
                      border: '2px solid #3498db',
                      background: 'white'
                    }}
                  >
                    {pinos.map((p) => (
                      <option 
                        key={p._id} 
                        value={p._id}
                        style={{
                          padding: '8px',
                          margin: '2px 0',
                          background: form.pinIds.includes(p._id) ? '#3498db' : 'white',
                          color: form.pinIds.includes(p._id) ? 'white' : 'black'
                        }}
                      >
                        📍 {p.nome} - {p.capibas} capibas
                      </option>
                    ))}
                  </select>
                  <div className="select-footer">
                    <small>Selecione múltiplos com Ctrl (Windows) ou Cmd (Mac)</small>
                    <span className="selecionados">{form.pinIds.length} selecionado(s)</span>
                  </div>
                </>
              ) : (
                <div className="sem-pinos">
                  <p style={{color: '#e74c3c', fontWeight: 'bold'}}>⚠️ Nenhum pino disponível</p>
                  <button 
                    type="button"
                    onClick={() => {
                      // Forçar dados de exemplo
                      const novosPinos = [
                        { _id: "manual1", nome: "Pino Manual 1", capibas: 100 },
                        { _id: "manual2", nome: "Pino Manual 2", capibas: 200 }
                      ];
                      setPinos(novosPinos);
                      setErro("✅ Dados manuais carregados");
                    }}
                    style={{
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '10px',
                      fontSize: '14px'
                    }}
                  >
                    🔧 Carregar Dados Manuais
                  </button>
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