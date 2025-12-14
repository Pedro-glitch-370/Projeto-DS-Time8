import { useEffect, useState } from "react";
import "./tarefasSolicitadas.css";
import { solicitacaoService } from "../../../services/solicitacaoService";

export default function TarefasSolicitadas() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [solicitacaoEditando, setSolicitacaoEditando] = useState(null);
  
  const [novaSolicitacao, setNovaSolicitacao] = useState({
    nome: "",
    descricao: "",
    capibas: 0
  });
  
  const [filtroStatus, setFiltroStatus] = useState("todas");

  // Verificar login
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("⚠️ Você precisa estar logado para acessar as solicitações!");
      window.location.href = "/";
      return;
    }

    try {
      const user = JSON.parse(userData);
      setUsuarioLogado(user);
    } catch (error) {
      console.error("Erro ao parsear dados do usuário:", error);
      window.location.href = "/";
    }
  }, []);

  // Carregar solicitações
  useEffect(() => {
    async function carregarSolicitacoes() {
      try {
        setLoading(true);
        const data = await solicitacaoService.getSolicitacoes();
        setSolicitacoes(data);
      } catch (error) {
        console.error("❌ Erro ao carregar solicitações:", error);
        alert("Erro ao carregar solicitações. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    if (usuarioLogado) {
      carregarSolicitacoes();
    }
  }, [usuarioLogado]);

  // Filtrar solicitações
  const solicitacoesFiltradas = solicitacoes.filter(solicitacao => {
    if (filtroStatus === "todas") return true;
    return solicitacao.status === filtroStatus;
  });

  // Função para obter nome do solicitante
  const getNomeSolicitante = (solicitacao) => {
    // Se tiver enviadoPor como objeto
    if (solicitacao.enviadoPor && typeof solicitacao.enviadoPor === 'object') {
      return solicitacao.enviadoPor.nome || "Usuário";
    }
    
    // Se tiver nomeUsuario
    if (solicitacao.nomeUsuario) {
      return solicitacao.nomeUsuario;
    }
    
    return "Usuário";
  };

  // Função para verificar se a solicitação é do usuário atual
  const isSolicitacaoDoUsuario = (solicitacao) => {
    if (!usuarioLogado || !solicitacao) return false;
    
    const usuarioId = usuarioLogado.id?.toString() || usuarioLogado._id?.toString();
    if (!usuarioId || !solicitacao.enviadoPor) return false;
    
    // Se enviadoPor for objeto
    if (typeof solicitacao.enviadoPor === 'object') {
      const solicitacaoId = solicitacao.enviadoPor._id?.toString();
      return solicitacaoId === usuarioId;
    }
    
    // Se enviadoPor for string
    if (typeof solicitacao.enviadoPor === 'string') {
      return solicitacao.enviadoPor === usuarioId;
    }
    
    return false;
  };

  // Função para abrir edição
  const handleAbrirEdicao = (solicitacao) => {
    const isOwner = isSolicitacaoDoUsuario(solicitacao);
    
    if (!isOwner) {
      alert("⚠️ Você não tem permissão para editar esta solicitação!");
      return;
    }
    
    if (solicitacao.status !== "pendente") {
      alert("⚠️ Não é possível editar uma solicitação já revisada!");
      return;
    }
    
    setSolicitacaoEditando(solicitacao);
    setNovaSolicitacao({
      nome: solicitacao.nome,
      descricao: solicitacao.msg,
      capibas: solicitacao.capibas
    });
    setMostrarFormulario(true);
  };

  // Função para cancelar edição
  const handleCancelarEdicao = () => {
    setSolicitacaoEditando(null);
    setNovaSolicitacao({ nome: "", descricao: "", capibas: 0 });
    setMostrarFormulario(false);
  };

  // Função para enviar nova solicitação ou atualizar
  const handleEnviarSolicitacao = async (e) => {
    e.preventDefault();
    
    if (!novaSolicitacao.nome.trim() || !novaSolicitacao.descricao.trim()) {
      alert("Por favor, preencha o nome e a descrição da tarefa.");
      return;
    }

    try {
      if (solicitacaoEditando) {
        await solicitacaoService.atualizarSolicitacao(
          solicitacaoEditando._id,
          novaSolicitacao.nome,
          novaSolicitacao.descricao,
          novaSolicitacao.capibas
        );
        alert("✅ Solicitação atualizada com sucesso!");
      } else {
        await solicitacaoService.criarSolicitacao(
          novaSolicitacao.nome,
          novaSolicitacao.descricao,
          novaSolicitacao.capibas
        );
        alert("✅ Solicitação enviada com sucesso!");
      }
      
      setSolicitacaoEditando(null);
      setNovaSolicitacao({ nome: "", descricao: "", capibas: 0 });
      setMostrarFormulario(false);
      
      const data = await solicitacaoService.getSolicitacoes();
      setSolicitacoes(data);
      
    } catch (error) {
      console.error("❌ Erro ao enviar/atualizar solicitação:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Erro: ${errorMsg}`);
    }
  };

  // Funções para admin
  const handleAprovarSolicitacao = async (id) => {
    if (!window.confirm("Tem certeza que deseja aprovar esta solicitação?")) return;
    
    try {
      await solicitacaoService.aprovarSolicitacao(id);
      alert("✅ Solicitação aprovada!");
      
      setSolicitacoes(prev =>
        prev.map(s =>
          s._id === id ? { 
            ...s, 
            status: 'aprovada', 
            aprovadoPor: usuarioLogado.nome 
          } : s
        )
      );
    } catch (error) {
      console.error("❌ Erro ao aprovar solicitação:", error);
      alert("Erro ao aprovar solicitação");
    }
  };

  const handleRejeitarSolicitacao = async (id) => {
    const motivo = prompt("Digite o motivo da rejeição:");
    if (!motivo) return;
    
    try {
      await solicitacaoService.rejeitarSolicitacao(id, motivo);
      alert("❌ Solicitação rejeitada.");
      
      setSolicitacoes(prev =>
        prev.map(s =>
          s._id === id ? { 
            ...s, 
            status: 'rejeitada', 
            motivoRejeicao: motivo,
            aprovadoPor: usuarioLogado.nome 
          } : s
        )
      );
    } catch (error) {
      console.error("❌ Erro ao rejeitar solicitação:", error);
      alert("Erro ao rejeitar solicitação");
    }
  };

  const handleDeletarSolicitacao = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta solicitação?")) return;
    
    try {
      await solicitacaoService.deletarSolicitacao(id);
      alert("🗑️ Solicitação excluída.");
      
      setSolicitacoes(prev => prev.filter(s => s._id !== id));
    } catch (error) {
      console.error("❌ Erro ao excluir solicitação:", error);
      alert("Erro ao excluir solicitação");
    }
  };

  // Função para obter badge de status
  const getStatusBadge = (status) => {
    const badges = {
      pendente: { texto: "⏳ Pendente", classe: "status-pendente" },
      aprovada: { texto: "✅ Aprovada", classe: "status-aprovada" },
      rejeitada: { texto: "❌ Rejeitada", classe: "status-rejeitada" }
    };
    return badges[status] || { texto: status, classe: "" };
  };

  // Verificar permissões do usuário
  const verificarPermissao = (solicitacao) => {
    if (!usuarioLogado || !solicitacao) return false;
    
    const isOwner = isSolicitacaoDoUsuario(solicitacao);
    const isAdmin = usuarioLogado.tipo === "admin";
    
    return {
      podeEditar: isOwner && solicitacao.status === "pendente",
      podeExcluir: isOwner || isAdmin,
      podeAprovarRejeitar: isAdmin && solicitacao.status === "pendente",
      isOwner,
      isAdmin
    };
  };

  if (loading) {
    return (
      <div className="solicitacoes-container">
        <div className="loading-solicitacoes">
          <div className="spinner"></div>
          <h3>Carregando solicitações...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitacoes-container">
      {/* Cabeçalho */}
      <div className="solicitacoes-header">
        <h1>📋 {usuarioLogado?.tipo === "admin" ? "Todas as Solicitações" : "Minhas Solicitações"}</h1>
        <p>
          {usuarioLogado?.tipo === "admin" 
            ? "Gerencie todas as solicitações do sistema" 
            : "Sugira novas tarefas ou acompanhe suas sugestões"}
        </p>
      </div>

      {/* Estatísticas */}
      <div className="solicitacoes-stats">
        <div className="stat-card">
          <div className="stat-number">{solicitacoes.length}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{solicitacoes.filter(s => s.status === 'pendente').length}</div>
          <div className="stat-label">Pendentes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{solicitacoes.filter(s => s.status === 'aprovada').length}</div>
          <div className="stat-label">Aprovadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{solicitacoes.filter(s => s.status === 'rejeitada').length}</div>
          <div className="stat-label">Rejeitadas</div>
        </div>
      </div>

      {/* Botão para nova solicitação (apenas clientes) */}
      {usuarioLogado?.tipo === "cliente" && (
        <div className="nova-solicitacao-btn-container">
          <button 
            className="btn-nova-solicitacao"
            onClick={() => {
              setSolicitacaoEditando(null);
              setNovaSolicitacao({ nome: "", descricao: "", capibas: 0 });
              setMostrarFormulario(!mostrarFormulario);
            }}
          >
            {mostrarFormulario ? "✖️ Cancelar" : "➕ Sugerir Nova Tarefa"}
          </button>
        </div>
      )}

      {/* Formulário de nova/editar solicitação */}
      {mostrarFormulario && (
        <div className="form-nova-solicitacao">
          <h3>{solicitacaoEditando ? "✏️ Editar Solicitação" : "📝 Sugerir Nova Tarefa"}</h3>
          <form onSubmit={handleEnviarSolicitacao}>
            <div className="form-group">
              <label>Nome da Tarefa *</label>
              <input
                type="text"
                value={novaSolicitacao.nome}
                onChange={(e) => setNovaSolicitacao({...novaSolicitacao, nome: e.target.value})}
                placeholder="Ex: Coletar amostras no jardim"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Descrição da Tarefa *</label>
              <textarea
                value={novaSolicitacao.descricao}
                onChange={(e) => setNovaSolicitacao({...novaSolicitacao, descricao: e.target.value})}
                placeholder="Descreva detalhadamente a tarefa..."
                rows="4"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Capibas Sugeridos (opcional)</label>
              <input
                type="number"
                min="0"
                value={novaSolicitacao.capibas}
                onChange={(e) => setNovaSolicitacao({...novaSolicitacao, capibas: parseInt(e.target.value) || 0})}
                placeholder="Quantidade de capibas"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-enviar">
                {solicitacaoEditando ? "Atualizar Solicitação" : "Enviar Solicitação"}
              </button>
              <button 
                type="button" 
                className="btn-cancelar"
                onClick={handleCancelarEdicao}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="solicitacoes-filtros">
        <div className="filtros-container">
          <label>Filtrar por status:</label>
          <select 
            value={filtroStatus} 
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="select-filtro"
          >
            <option value="todas">Todas</option>
            <option value="pendente">⏳ Pendentes</option>
            <option value="aprovada">✅ Aprovadas</option>
            <option value="rejeitada">❌ Rejeitadas</option>
          </select>
        </div>
      </div>

      {/* Lista de solicitações */}
      <div className="solicitacoes-lista">
        {solicitacoesFiltradas.length === 0 ? (
          <div className="sem-solicitacoes">
            <div className="icone-vazio">📭</div>
            <h3>Nenhuma solicitação encontrada</h3>
            <p>
              {filtroStatus === "todas" 
                ? usuarioLogado?.tipo === "admin"
                  ? "Nenhuma solicitação foi enviada ainda."
                  : "Você ainda não enviou nenhuma solicitação." 
                : `Nenhuma solicitação com status "${filtroStatus}"`}
            </p>
          </div>
        ) : (
          solicitacoesFiltradas.map((solicitacao) => {
            const statusBadge = getStatusBadge(solicitacao.status);
            const permissoes = verificarPermissao(solicitacao);
            const nomeSolicitante = getNomeSolicitante(solicitacao);
            
            return (
              <div key={solicitacao._id} className="solicitacao-card">
                {/* Header com nome da tarefa e status */}
                <div className="solicitacao-header">
                  <h3>{solicitacao.nome}</h3>
                  <span className={`status-badge ${statusBadge.classe}`}>
                    {statusBadge.texto}
                  </span>
                </div>
                
                {/* Área do solicitante (separada) */}
                <div className="solicitacao-solicitante">
                  <div className="solicitante-info">
                    <span className="solicitante-icon">👤</span>
                    <div className="solicitante-detalhes">
                      <span className="solicitante-label">Solicitante:</span>
                      <span className="solicitante-nome">{nomeSolicitante}</span>
                    </div>
                  </div>
                </div>
                
                {/* Descrição da tarefa */}
                <div className="solicitacao-body">
                  <p className="solicitacao-descricao">{solicitacao.msg}</p>
                </div>
                
                {/* Informações adicionais */}
                <div className="solicitacao-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">💰 Capibas Sugeridos:</span>
                    <span className="metadata-value">{solicitacao.capibas}</span>
                  </div>
                  
                  <div className="metadata-item">
                    <span className="metadata-label">📅 Data:</span>
                    <span className="metadata-value">
                      {new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {solicitacao.aprovadoPor && (
                    <div className="metadata-item">
                      <span className="metadata-label">✅ Aprovado por:</span>
                      <span className="metadata-value">{solicitacao.aprovadoPor}</span>
                    </div>
                  )}
                  
                  {solicitacao.motivoRejeicao && (
                    <div className="metadata-item">
                      <span className="metadata-label">❌ Motivo da rejeição:</span>
                      <span className="metadata-value">{solicitacao.motivoRejeicao}</span>
                    </div>
                  )}
                </div>
                
                {/* Ações */}
                <div className="solicitacao-actions">
                  {/* Ações para Admin */}
                  {permissoes.podeAprovarRejeitar && (
                    <>
                      <button 
                        className="btn-aprovar"
                        onClick={() => handleAprovarSolicitacao(solicitacao._id)}
                      >
                        ✅ Aprovar
                      </button>
                      <button 
                        className="btn-rejeitar"
                        onClick={() => handleRejeitarSolicitacao(solicitacao._id)}
                      >
                        ❌ Rejeitar
                      </button>
                    </>
                  )}
                  
                  {/* Ações para Cliente (dono) */}
                  {permissoes.podeEditar && (
                    <button 
                      className="btn-editar"
                      onClick={() => handleAbrirEdicao(solicitacao)}
                    >
                      ✏️ Editar
                    </button>
                  )}
                  
                  {/* Botão de excluir (admin ou dono) */}
                  {permissoes.podeExcluir && (
                    <button 
                      className="btn-deletar"
                      onClick={() => handleDeletarSolicitacao(solicitacao._id)}
                    >
                      🗑️ Excluir
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Seção "Como usar" */}
      <div className="solicitacoes-info">
        <div className="info-card">
          <h4>📋 Como usar esta página?</h4>
          <div className="info-content">
            <div className="info-item">
              <div className="info-icon">➕</div>
              <div className="info-text">
                <h5>Sugerir nova tarefa</h5>
                <p>Clique no botão "Sugerir Nova Tarefa" para enviar uma sugestão de atividade.</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">👤</div>
              <div className="info-text">
                <h5>Ver solicitante</h5>
                <p>Cada tarefa mostra quem a sugeriu na seção "Solicitante".</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">⏳✅❌</div>
              <div className="info-text">
                <h5>Status das solicitações</h5>
                <p>
                  <strong>⏳ Pendente:</strong> Aguardando aprovação<br/>
                  <strong>✅ Aprovada:</strong> Tarefa aceita<br/>
                  <strong>❌ Rejeitada:</strong> Tarefa não aceita
                </p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">🔧</div>
              <div className="info-text">
                <h5>Editar/Excluir</h5>
                <p>Você pode editar ou excluir apenas suas próprias solicitações pendentes.</p>
              </div>
            </div>
            
            {usuarioLogado?.tipo === "admin" && (
              <div className="info-item">
                <div className="info-icon">👑</div>
                <div className="info-text">
                  <h5>Funções de administrador</h5>
                  <p>Como administrador, você pode aprovar ou rejeitar qualquer solicitação pendente.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}