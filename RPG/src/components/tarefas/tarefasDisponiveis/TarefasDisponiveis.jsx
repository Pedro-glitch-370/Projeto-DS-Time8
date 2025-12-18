import { useEffect, useState } from "react";
import "./tarefasDisponiveis.css";
import { pinoService } from "../../../services/pinoService";

export default function TarefasDisponiveis() {
  const [usuarioLogado, setUsuarioLogado] = useState(null); 
  const [tarefas, setTarefas] = useState([]);
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const pinos = await pinoService.getPinos();
        const concluidas = usuarioLogado?.tarefasConcluidas || [];

        // Mapeia todas as tarefas
        const todas = pinos.map((pino) => ({
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
          {/* BOTÃO REMOVIDO - APENAS VISUALIZAÇÃO */}
        </div>
      ))}
    </div>
  );
}