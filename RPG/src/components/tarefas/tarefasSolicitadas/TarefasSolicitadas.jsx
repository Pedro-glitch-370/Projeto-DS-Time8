import { useEffect, useState, useRef } from "react";
import { useUser } from "../../../context/ExportsContext";
import "./tarefasSolicitadas.css";
import { solicitacaoService } from "../../../services/solicitacaoService";
import LoadingMenor from "../../loading/LoadingMenor";

export default function TarefasSolicitadas() {
  const { usuarioLogado } = useUser(); 
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [solicitacaoEditando, setSolicitacaoEditando] = useState(null);
  
  const [novaSolicitacao, setNovaSolicitacao] = useState({
    nome: "",
    descricao: "",
    capibas: ""
  });
  
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const toggleFormulario = () => {
    setSolicitacaoEditando(null);
    setNovaSolicitacao({ nome: "", descricao: "", capibas: "" });
    setMostrarFormulario(!mostrarFormulario);
  };
  const formularioRef = useRef(null);

  const [ativaSolicitacao, setAtivaSolicitacao] = useState(null);
  const toggleSolicitacao = (id) => {
    setAtivaSolicitacao(ativaSolicitacao === id ? null : id);
  };

  const [tutorialAtivo, setTutorialAtivo] = useState(false);
  const toggleTutorial = () => setTutorialAtivo(!tutorialAtivo);

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

  // Função para obter nome do solicitante formatado
  const getNomeSolicitanteFormatado = (solicitacao) => {
    let nomeBase = "Usuário";
    
    // Se tiver enviadoPor como objeto
    if (solicitacao.enviadoPor && typeof solicitacao.enviadoPor === 'object') {
      nomeBase = solicitacao.enviadoPor.nome || nomeBase;
    } else if (solicitacao.nomeUsuario) {
      nomeBase = solicitacao.nomeUsuario;
    }
    
    // Verificar se é do usuário atual
    const isOwner = isSolicitacaoDoUsuario(solicitacao);
    
    // Se for o usuário atual, mostrar apenas "Você"
    if (isOwner) {
      return {
        displayName: "Você",
        isCurrentUser: true,
        originalName: nomeBase
      };
    }
    
    // Se for outro usuário, mostrar o nome dele
    return {
      displayName: nomeBase,
      isCurrentUser: false,
      originalName: nomeBase
    };
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
      capibas: solicitacao.capibas || "" // Converte 0 para string vazia se for 0
    });
    setMostrarFormulario(true);
    setTimeout(() => {
      formularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Função para cancelar edição
  const handleCancelarEdicao = () => {
    setSolicitacaoEditando(null);
    setNovaSolicitacao({ nome: "", descricao: "", capibas: "" });
    setMostrarFormulario(false);
  };

  // Função para validar e enviar nova solicitação ou atualizar
  const handleEnviarSolicitacao = async (e) => {
    e.preventDefault();
    
    if (!novaSolicitacao.nome.trim() || !novaSolicitacao.descricao.trim()) {
      alert("Por favor, preencha o nome e a descrição da tarefa.");
      return;
    }

    // Validação do campo capibas
    let capibasNumero;
    if (novaSolicitacao.capibas.trim() === "") {
      // Se estiver vazio, define como 0
      capibasNumero = 0;
    } else {
      const valor = parseInt(novaSolicitacao.capibas);
      
      // Verifica se é um número válido e não negativo
      if (isNaN(valor) || valor < 0) {
        alert("Por favor, insira um número válido de capibas (não negativo).");
        return;
      }
      
      capibasNumero = valor;
    }

    try {
      if (solicitacaoEditando) {
        await solicitacaoService.atualizarSolicitacao(
          solicitacaoEditando._id,
          novaSolicitacao.nome,
          novaSolicitacao.descricao,
          capibasNumero
        );
        alert("✅ Solicitação atualizada com sucesso!");
      } else {
        await solicitacaoService.criarSolicitacao(
          novaSolicitacao.nome,
          novaSolicitacao.descricao,
          capibasNumero
        );
        alert("✅ Solicitação enviada com sucesso!");
      }
      
      setSolicitacaoEditando(null);
      setNovaSolicitacao({ nome: "", descricao: "", capibas: "" });
      setMostrarFormulario(false);
      
      const data = await solicitacaoService.getSolicitacoes();
      setSolicitacoes(data);
      
    } catch (error) {
      console.error("❌ Erro ao enviar/atualizar solicitação:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Erro: ${errorMsg}`);
    }
  };

  // Função para lidar com mudança no campo capibas
  const handleCapibasChange = (e) => {
    const valor = e.target.value;
    
    // Permite apenas números ou string vazia
    if (valor === "" || /^\d*$/.test(valor)) {
      setNovaSolicitacao({
        ...novaSolicitacao,
        capibas: valor
      });
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
    return <LoadingMenor />
  }

  return (
    <div className="solicitacoes-container">
      {/* Cabeçalho */}
      <div className="solicitacao-card">
        <div className="solicitacoes-header">
          <h2>📋 {usuarioLogado?.tipo === "admin" ? "Gerenciar Solicitações" : "Minhas Solicitações"}</h2>
        </div>

        {/* Estatísticas */}
        <div className="solicitacoes-stats">
          <div className="stat-card-solicitar">
            <div className="stat-number">{solicitacoes.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card-solicitar">
            <div className="stat-number">{solicitacoes.filter(s => s.status === 'pendente').length}</div>
            <div className="stat-label">Pendentes</div>
          </div>
          <div className="stat-card-solicitar">
            <div className="stat-number">{solicitacoes.filter(s => s.status === 'aprovada').length}</div>
            <div className="stat-label">Aprovadas</div>
          </div>
          <div className="stat-card-solicitar">
            <div className="stat-number">{solicitacoes.filter(s => s.status === 'rejeitada').length}</div>
            <div className="stat-label">Rejeitadas</div>
          </div>
        </div>

        {usuarioLogado?.tipo === "cliente" && (
          <div
            className={`solicitacao-wrapper ${mostrarFormulario ? "ativa" : ""}`}
          >
            <button className={`solicitacao-titulo ${mostrarFormulario ? "ativo" : "inativo"}`}
                    onClick={toggleFormulario}
            >
              {mostrarFormulario ? "Sugerindo Tarefa" : "Sugerir Nova Tarefa"}
            </button>

            <div ref={formularioRef} className="conteudo-solicitacao">
              {mostrarFormulario && (
                <form onSubmit={handleEnviarSolicitacao}>
                  <div className="form-group">
                    <label>Nome da Tarefa *</label>
                    <input
                      type="text"
                      value={novaSolicitacao.nome}
                      onChange={(e) =>
                        setNovaSolicitacao({
                          ...novaSolicitacao,
                          nome: e.target.value,
                        })
                      }
                      placeholder="Ex: Coletar amostras no jardim"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Descrição da Tarefa *</label>
                    <textarea
                      value={novaSolicitacao.descricao}
                      onChange={(e) =>
                        setNovaSolicitacao({
                          ...novaSolicitacao,
                          descricao: e.target.value,
                        })
                      }
                      placeholder="Descreva detalhadamente a tarefa"
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Capibas Sugeridos (opcional)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={novaSolicitacao.capibas}
                      onChange={handleCapibasChange}
                      placeholder="Quantidade de capibas"
                      min="0"
                    />
                    <small className="form-hint">
                      Digite um número não negativo. Deixe em branco para 0.
                    </small>
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
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista de solicitações */}
      <div className="solicitacao-card">
        <div className="solicitacoes-header">
          <h2>📩 Solicitações Enviadas</h2>
        </div>
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
            const solicitanteInfo = getNomeSolicitanteFormatado(solicitacao);
            
            return (
              <div key={solicitacao._id}
                   className={`solicitacao-filtrada ${ativaSolicitacao === solicitacao._id ? "ativa" : ""}`}    
              >
                {/* Header com nome da tarefa e status */}
                <div className="solicitacao-header" onClick={() => toggleSolicitacao(solicitacao._id)}>
                  <h3>{solicitacao.nome}</h3>
                  <span className={`status-badge ${statusBadge.classe}`}>
                    {statusBadge.texto}
                  </span>
                </div>
                
                {/* Conteúdo expansível */}
                <section className="conteudo-solicitacao">
                  <div className="solicitacao-metadata" id="solicitacao-descricao">
                    <div className="metadata-item">
                      <span className="metadata-label">✍️ Descrição:</span>
                      <span className="metadata-value">{solicitacao.msg}</span>
                    </div>
                  </div>
                  <div className="solicitacao-metadata">
                    <div className="metadata-item">
                      <span className="metadata-label">💰 Capibas Sugeridos:</span>
                      <span className="metadata-value">{solicitacao.capibas || 0}</span>
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
                  
                  <div className="metadata-item">
                      <div className="solicitante-detalhes">
                        <span className="metadata-label">👤 Solicitante:</span>
                        <span className={`solicitante-nome ${solicitanteInfo.isCurrentUser ? 'solicitante-atual' : ''}`}>
                          {solicitanteInfo.displayName}
                        </span>
                      </div>
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
                          Aprovar
                        </button>
                        <button 
                          className="btn-rejeitar"
                          onClick={() => handleRejeitarSolicitacao(solicitacao._id)}
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    
                    {/* Ações para Cliente (dono) */}
                    {permissoes.podeEditar && (
                      <button 
                        className="btn-editar"
                        onClick={() => handleAbrirEdicao(solicitacao)}
                      >
                        Editar
                      </button>
                    )}
                    
                    {/* Botão de excluir (admin ou dono) */}
                    {permissoes.podeExcluir && (
                      <button 
                        className="btn-deletar"
                        onClick={() => handleDeletarSolicitacao(solicitacao._id)}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </section>
              </div>
            );
          })
        )}
      </div>

      {/* Seção "Como usar" */}
      <div className={`solicitacoes-info ${tutorialAtivo ? "ativa" : ""}`}>
        <div className="info-card" onClick={toggleTutorial}>
          <h4 className="info-titulo">
            {tutorialAtivo ? "📘 Como usar esta página" : "📘 Mostrar instruções"}
          </h4>

          <div className="info-content">
            {tutorialAtivo && (
              <>
                <div className="info-item" id="primeiro-info-item">
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
                    <p>Cada tarefa mostra quem a sugeriu na seção "Solicitante". Se for você, aparecerá apenas "Você".</p>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}