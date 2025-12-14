import { useEffect, useState } from "react";
import "./tarefasDisponiveis.css";
import { clienteService } from "../../../services/clienteService";
import { adminService } from "../../../services/adminService";

export default function TarefasDisponiveis() {
  const [usuarioLogado, setUsuarioLogado] = useState(null); 
  const [tarefas, setTarefas] = useState([]);
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState([]); // Nova state
  const [loading, setLoading] = useState(true);
  const [popupAberto, setPopupAberto] = useState(false);
  const [tarefaAtual, setTarefaAtual] = useState(null);

  // Verificar login e carregar dados do usuário
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("⚠️ Você precisa estar logado para acessar as tarefas!");
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

  // Salvar no localStorage
  useEffect(() => {
    if (usuarioLogado) {
      localStorage.setItem("user", JSON.stringify(usuarioLogado));
    }
  }, [usuarioLogado]);

  // Carregar tarefas da API e filtrar
  useEffect(() => {
    async function carregarTarefas() {
      try {
        const res = await fetch("/api/temporadas/atual", {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": usuarioLogado?.id,
            "x-user-tipo": usuarioLogado?.tipo
          }
        });

        const data = await res.json();
        const concluidas = usuarioLogado?.tarefasConcluidas || [];

        // Se não tiver nenhuma temporada ativa
        if (!data.temporada) {
          setTarefas([]);
          setTarefasDisponiveis([]);
          setLoading(false);
          return;
        }

        // Mapeia todas as tarefas
        const todas = data.pinos.map((pino) => ({
          id: pino._id,
          nome: pino.nome,
          descricao: pino.msg,
          recompensa: pino.capibas || 0,
          capibas: pino.capibas || 0,
          concluida: concluidas.includes(pino._id),
        }));

        setTarefas(todas);
        
        // FILTRA: Mostra apenas tarefas NÃO concluídas
        const disponiveis = todas.filter(tarefa => !tarefa.concluida);
        setTarefasDisponiveis(disponiveis);
        
      } catch (error) {
        console.error("❌ Erro ao carregar tarefas:", error);
      } finally {
        setLoading(false);
      }
    }

    if (usuarioLogado) carregarTarefas();
  }, [usuarioLogado]);

  // Atualizar tarefas disponíveis quando o usuário ou tarefas mudarem
  useEffect(() => {
    if (tarefas.length > 0) {
      const disponiveis = tarefas.filter(tarefa => !tarefa.concluida);
      setTarefasDisponiveis(disponiveis);
    }
  }, [tarefas]);

  // Abrir popup
  function abrirPopupTarefa(tarefa) {
    setTarefaAtual(tarefa);
    setPopupAberto(true);
    document.body.style.overflow = "hidden";
  }

  // Fechar popup
  function fecharPopupTarefa() {
    setPopupAberto(false);
    setTarefaAtual(null);
    document.body.style.overflow = "auto";
  }

  // Fechar com Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        fecharPopupTarefa();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  async function concluirTarefa() {
    console.log("🔍 DEBUG - Iniciando conclusão da tarefa");
    
    if (!tarefaAtual || !usuarioLogado) return;

    try {
      let resultado;
      const novaTarefaConcluida = tarefaAtual.id;
      const novaRecompensa = tarefaAtual.recompensa || tarefaAtual.capibas || 0;

      if (usuarioLogado.tipo === "admin") {
        console.log("⚠️ Admin testando tarefa (sem capibas)");
        
        try {
          resultado = await adminService.concluirTarefa(
            usuarioLogado.id,
            tarefaAtual.id
          );
          
          setUsuarioLogado(prev => ({
            ...prev,
            tarefasCompletas: resultado.tarefasCompletas || (prev.tarefasCompletas + 1),
            tarefasConcluidas: [...(prev.tarefasConcluidas || []), novaTarefaConcluida]
          }));
          
          // ATUALIZAR TAREFAS: Marcar como concluída
          setTarefas(prev =>
            prev.map(t =>
              t.id === tarefaAtual.id ? { ...t, concluida: true } : t
            )
          );
          
          mostrarMensagemSucesso(novaRecompensa, false);
        } catch (error) {
          console.warn("⚠️ AdminService falhou, usando fallback local:", error.message);
          setUsuarioLogado(prev => ({
            ...prev,
            tarefasCompletas: (prev.tarefasCompletas || 0) + 1,
            tarefasConcluidas: [...(prev.tarefasConcluidas || []), novaTarefaConcluida]
          }));
          
          // ATUALIZAR TAREFAS: Marcar como concluída mesmo no fallback
          setTarefas(prev =>
            prev.map(t =>
              t.id === tarefaAtual.id ? { ...t, concluida: true } : t
            )
          );
          
          mostrarErroConclusao(true);
        }
      } else {
        console.log("👤 Cliente concluindo tarefa (ganha capibas)");
        
        try {
          resultado = await clienteService.concluirTarefa(
            usuarioLogado.id,
            tarefaAtual.id,
            novaRecompensa
          );
          
          setUsuarioLogado(prev => ({
            ...prev,
            capibas: resultado.capibas || ((prev.capibas || 0) + novaRecompensa),
            tarefasCompletas: resultado.tarefasCompletas || (prev.tarefasCompletas + 1),
            tarefasConcluidas: resultado.tarefasConcluidas || [...(prev.tarefasConcluidas || []), novaTarefaConcluida]
          }));
          
          // ATUALIZAR TAREFAS: Marcar como concluída
          setTarefas(prev =>
            prev.map(t =>
              t.id === tarefaAtual.id ? { ...t, concluida: true } : t
            )
          );
          
          mostrarMensagemSucesso(novaRecompensa, true);
        } catch (error) {
          console.warn("⚠️ ClienteService falhou, usando fallback local:", error.message);
          
          setUsuarioLogado(prev => ({
            ...prev,
            capibas: (prev.capibas || 0) + novaRecompensa,
            tarefasCompletas: (prev.tarefasCompletas || 0) + 1,
            tarefasConcluidas: [...(prev.tarefasConcluidas || []), novaTarefaConcluida]
          }));
          
          // ATUALIZAR TAREFAS: Marcar como concluída mesmo no fallback
          setTarefas(prev =>
            prev.map(t =>
              t.id === tarefaAtual.id ? { ...t, concluida: true } : t
            )
          );
          
          mostrarErroConclusao(false);
        }
      }

      // Fechar popup
      setTarefaAtual(null);
      setPopupAberto(false);

    } catch (error) {
      console.error("❌ Erro ao concluir tarefa:", error);
      alert("❌ Ocorreu um erro ao concluir a tarefa. Tente novamente.");
    }
  }

  function mostrarMensagemSucesso(recompensa, isCliente) {
    if (!usuarioLogado) return;

    if (isCliente) {
      const novoTotalCapibas = (usuarioLogado.capibas || 0) + recompensa;
      const novasTarefasCompletas = (usuarioLogado.tarefasCompletas || 0) + 1;
      
      alert(`🎉 Parabéns! Você ganhou ${recompensa} capibas!\n\n💰 Total: ${novoTotalCapibas} capibas\n✅ Tarefas completas: ${novasTarefasCompletas}`);
    } else {
      const novasTarefasCompletas = (usuarioLogado.tarefasCompletas || 0) + 1;
      alert(`✅ Tarefa testada com sucesso!\n\n📊 Tarefas testadas: ${novasTarefasCompletas}`);
    }
  }

  function mostrarErroConclusao(isAdmin) {
    if (isAdmin) {
      alert("❌ Erro ao testar tarefa. Tente novamente.");
    } else {
      alert("❌ Erro ao concluir tarefa. Tente novamente.");
    }
  }

  if (loading) {
    return (
      <div className="sem-tarefas">
        <h3>Carregando tarefas...</h3>
        <p>Aguarde enquanto buscamos tarefas</p>
      </div>
    );
  }

  // MODIFICADO: Agora verifica tarefasDisponiveis, não todas as tarefas
  if (tarefasDisponiveis.length === 0) {
    return (
      <div className="sem-tarefas">
        <h3>🎉 Parabéns!</h3>
        <p>Você completou todas as tarefas disponíveis!</p>
        <p className="status-info">
          {usuarioLogado?.tipo === "cliente" 
            ? `💰 Total de capibas: ${usuarioLogado.capibas || 0}`
            : `📊 Tarefas testadas: ${usuarioLogado?.tarefasCompletas || 0}`
          }
        </p>
      </div>
    );
  }

  // MODIFICADO: Renderiza tarefasDisponiveis, não todas as tarefas
  return (
    <div className="lista-tarefas">
      
      {tarefasDisponiveis.map((tarefa) => (
        <div
          key={tarefa.id}
          className="tarefa-item" // Removida a classe tarefa-concluida pois não mostra mais tarefas concluídas
        >
          <h3>{tarefa.nome}</h3>
          <p>{tarefa.descricao}</p>
          <p className="recompensa">
            🎁 Recompensa: {tarefa.recompensa} capibas
          </p>
          <button
            className="btn-confirmar"
            onClick={() => abrirPopupTarefa(tarefa)}
          >
            Confirmar Conclusão
          </button>
        </div>
      ))}

      {popupAberto && (
        <div className="popup-tarefa" onClick={(e) => e.target === e.currentTarget && fecharPopupTarefa()}>
          <div className="popup-tarefa-content">
            <span className="close-popup" onClick={fecharPopupTarefa}>
              &times;
            </span>
            <h2>Confirmar Tarefa</h2>
            {tarefaAtual && (
              <>
                <p><strong>📍 Local:</strong> {tarefaAtual.nome}</p>
                <p><strong>📝 Descrição:</strong> {tarefaAtual.descricao}</p>
                <p><strong>💰 Recompensa:</strong> {tarefaAtual.recompensa} capibas</p>
              </>
            )}
            <div className="popup-actions">
              <button className="btn-concluir" onClick={concluirTarefa}>
                {usuarioLogado?.tipo === "admin" ? "Testar Tarefa" : "Confirmar Conclusão"}
              </button>
              <button className="btn-cancelar" onClick={fecharPopupTarefa}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}