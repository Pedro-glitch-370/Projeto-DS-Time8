import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./tarefasDisponiveis.css";
import { pinoService } from "../../../services/pinoService";
import LoadingMenor from "../../loading/LoadingMenor";

export default function TarefasDisponiveis() {
  const [usuarioLogado, setUsuarioLogado] = useState(null); 
  const [tarefas, setTarefas] = useState([]);
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ativa, setAtiva] = useState(null);

  const navigate = useNavigate();

  const toggleTarefa = (id) => {
    setAtiva(ativa === id ? null : id);
  };

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
        
        // Mostra apenas tarefas não concluídas
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
    return <LoadingMenor />
  }

  if (tarefasDisponiveis.length === 0) {
    return (
      <div className="sem-tarefas">
        <h3>Sem tarefas!</h3>
        <p>No momento, não há nenhuma tarefa disponível. Nos vemos na próxima temporada!</p>
        <p className="status-info">
          {usuarioLogado?.tipo === "cliente" 
            ? `💰 Total de capibas: ${usuarioLogado.capibas || 0}`
            : `📊 Tarefas testadas: ${usuarioLogado?.tarefasCompletas || 0}`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="lista-tarefas">
      {tarefasDisponiveis.map((tarefa) => (
        <div
          key={tarefa.id}
          className={`tarefa-item ${ativa === tarefa.id ? "ativa" : ""}`}
          onClick={() => toggleTarefa(tarefa.id)}
        >
          <h3>{tarefa.nome}</h3>
          <div className="conteudo">
            <p>{tarefa.descricao}</p>
            <p className="recompensa">
              Recompensa: <strong id="destaque-recompensa">{tarefa.recompensa} capibas</strong> 🪙
            </p>
          </div>
          <div className="botao-mapa" onClick={(e) => {
            e.stopPropagation();
            navigate("/mapa");
          }}>
              🗺️
          </div>
        </div>
      ))}
    </div>
  );
}