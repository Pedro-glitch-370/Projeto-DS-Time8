import { useEffect, useState } from "react";
import "./tarefasConcluidas.css";
import { pinoService } from "../../../services/pinoService";
import { clienteService } from "../../../services/clienteService";
import { adminService } from "../../../services/adminService";

export default function TarefasConcluidas() {
  const [usuarioLogado, setUsuarioLogado] = useState(null); 
  const [tarefas, setTarefas] = useState([]);
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

  // Carregar tarefas da API
  useEffect(() => {
    async function carregarTarefas() {
      try {
        const pinos = await pinoService.getPinos();
        const concluidas = usuarioLogado?.tarefasConcluidas || [];

        const todas = pinos.map((pino) => ({
          id: pino._id,
          nome: pino.nome,
          descricao: pino.msg,
          recompensa: pino.capibas || 0,
          concluida: concluidas.includes(pino._id),
        }));

        setTarefas(todas);
      } catch (error) {
        console.error("❌ Erro ao carregar tarefas:", error);
      } finally {
        setLoading(false);
      }
    }

    if (usuarioLogado) carregarTarefas();
  }, [usuarioLogado]);

  // Abrir popup
  function abrirPopupTarefa(tarefa) {
    setTarefaAtual(tarefa);   // guarda dados da tarefa
    setPopupAberto(true);     // mostra popup
    document.body.style.overflow = "hidden"; // trava scroll
  }

  // Fechar popup
  function fecharPopupTarefa() {
    setPopupAberto(false);
    setTarefaAtual(null);
    document.body.style.overflow = "auto"; // libera scroll
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
    if (!tarefaAtual || !usuarioLogado) return;

    try {
      let resultado;

      if (usuarioLogado.tipo === "admin") {
        console.log("⚠️ Admin testando tarefa (sem capibas)");
        try {
          resultado = await adminService.concluirTarefa(
            usuarioLogado.id,
            tarefaAtual.id
          );
          setUsuarioLogado(prev => ({
            ...prev,
            tarefasCompletas:
              resultado.tarefasCompletas || (prev.tarefasCompletas + 1),
          }));
          mostrarMensagemSucesso();
        } catch (error) {
          console.warn("⚠️ AdminService falhou, usando fallback local:", error.message);
          setUsuarioLogado(prev => ({
          ...prev,
          tarefasCompletas: (prev.tarefasCompletas || 0) + 1,
          }));
          mostrarErroConclusao();
        }
      } else {
        console.log("👤 Cliente concluindo tarefa (ganha capibas)");
        try {
          resultado = await clienteService.concluirTarefa(
            usuarioLogado.id,
            tarefaAtual.id,
            tarefaAtual.capibas
          );
          setUsuarioLogado(prev => ({
            ...prev,
            capibas: resultado.capibas,
            tarefasCompletas: resultado.tarefasCompletas,
            tarefasConcluidas: resultado.tarefasConcluidas || [],
          }));
          mostrarMensagemSucesso();
        } catch (error) {
          console.warn("⚠️ ClienteService falhou, usando fallback local:", error.message);
          setUsuarioLogado(prev => ({
            ...prev,
            capibas: (prev.capibas || 0) + tarefaAtual.capibas,
            tarefasCompletas: (prev.tarefasCompletas || 0) + 1,
            tarefasConcluidas: [...(prev.tarefasConcluidas || []), tarefaAtual.id],
          }));
          mostrarErroConclusao();
        }
      }

      // Atualizar lista de tarefas no state
      setTarefas(prev =>
        prev.map(t =>
          t.id === tarefaAtual.id ? { ...t, concluida: true } : t
        )
      );

      // Fechar popup
      setTarefaAtual(null);
      setPopupAberto(false);

    } catch (error) {
      console.error("❌ Erro ao concluir tarefa:", error);;
    }
  }

  function mostrarMensagemSucesso() {
    if (!usuarioLogado || !tarefaAtual) return;

    if (usuarioLogado.tipo === "admin") {
        alert(`✅ Tarefa testada com sucesso!\n\n📊 Tarefas testadas: ${usuarioLogado.tarefasCompletas}`);
    } else {
        alert(`🎉 Parabéns! Você ganhou ${tarefaAtual.capibas} capibas!\n\n💰 Total: ${usuarioLogado.capibas} capibas\n✅ Tarefas completas: ${usuarioLogado.tarefasCompletas}`);
    }
  }

  function mostrarErroConclusao() {
    if (!usuarioLogado) return;

    if (usuarioLogado.tipo === "admin") {
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

  if (tarefas.length === 0) {
    return (
      <div className="sem-tarefas">
        <h3>Nenhuma tarefa disponível</h3>
        <p>Volte mais tarde!</p>
      </div>
    );
  }

  return (
    <div className="lista-tarefas">
      {tarefas.map((tarefa) => (
        <div
          key={tarefa.id}
          className={`tarefa-item ${tarefa.concluida ? "tarefa-concluida" : ""}`}
        >
          <h3>{tarefa.nome}</h3>
          <p>{tarefa.descricao}</p>
          <p className="recompensa">
            Recompensa: {tarefa.recompensa} capibas
          </p>
          <button
            className="btn-confirmar"
            disabled={tarefa.concluida}
            onClick={() => abrirPopupTarefa(tarefa)}
          >
            {tarefa.concluida ? "Tarefa Concluída" : "Confirmar Conclusão"}
          </button>
        </div>
      ))}

      {popupAberto && (
        // O onClick abaixo é para fechar o popUp caso seja clicado fora dele
        <div className="popup-tarefa" onClick={(e) => e.target === e.currentTarget && fecharPopupTarefa()}>
          <div className="popup-tarefa-content">
            <span className="close-popup" onClick={fecharPopupTarefa}>
              &times;
            </span>
            <h2>Confirmar Tarefa</h2>
            {tarefaAtual && (
              <>
                <p>📍 Local: {tarefaAtual.nome}</p>
                <p>📝 Descrição: {tarefaAtual.descricao}</p>
                <p>💰 Recompensa: {tarefaAtual.recompensa} capibas</p>
              </>
            )}
            <div className="popup-actions">
              <button className="btn-concluir" onClick={concluirTarefa}>
                Confirmar Conclusão
              </button>
              <button className="btn-cancelar" onClick={fecharPopupTarefa}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
