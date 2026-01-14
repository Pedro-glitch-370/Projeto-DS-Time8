import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/ExportsContext";
import "./tarefasDisponiveis.css";
import { temporadaService } from "../../../services/temporadaService";
import LoadingMenor from "../../loading/LoadingMenor";

export default function TarefasDisponiveis() {
  const { usuarioLogado } = useUser(); 
  const [temporadaAtual, setTemporadaAtual] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ativa, setAtiva] = useState(null);
  const navigate = useNavigate();
  const toggleTarefa = (id) => {
    setAtiva(ativa === id ? null : id);
  };

  // Salvar no localStorage
  useEffect(() => {
    if (usuarioLogado) {
      localStorage.setItem("user", JSON.stringify(usuarioLogado));
    }
  }, [usuarioLogado]);

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

  // Carregar tarefas da API e filtrar
  useEffect(() => {
    async function carregarTarefas() {
      try {
        if (!temporadaAtual || !temporadaAtual.pinIds) return;

        const concluidas = usuarioLogado?.tarefasConcluidas || [];

        // Mapeia todas as tarefas
        const todas = temporadaAtual.pinIds.map((pino) => ({
            id: pino._id,
            nome: pino.nome,
            descricao: pino.msg,
            recompensa: pino.capibas || 0,
            capibas: pino.capibas || 0,
            concluida: concluidas.includes(pino._id),
        }))
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
  }, [temporadaAtual, usuarioLogado]);

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
        <header>
          <h2 className="titulo-tarefas">Sem Tarefas!</h2>
        </header>
        <main>
          <p className="sem-tarefas-descricao">No momento, não há nenhuma tarefa disponível. Nos vemos na próxima temporada!</p>
          <p className="sem-tarefas-extra">
            {usuarioLogado?.tipo === "cliente" 
              ? `💰 Total de capibas: ${usuarioLogado.capibas || 0}`
              : `📊 Tarefas testadas: ${usuarioLogado?.tarefasCompletas || 0}`
            }
          </p>
        </main>
      </div>
    );
  }

  return (
    <section className="secao-lista-tarefas">
      <header className="header-lista-tarefas">
        <h2 className="titulo-lista-tarefas">⚔️ Tarefas da Temporada</h2>
        <p className="subtitulo-tarefas">Temporada atual: {temporadaAtual.titulo}</p>
      </header>
      <main className="lista-tarefas">
        {tarefasDisponiveis.map((tarefa) => (
          <section
            key={tarefa.id}
            className={`tarefa-item ${ativa === tarefa.id ? "ativa" : ""}`}
            onClick={() => toggleTarefa(tarefa.id)}
          >
            <h3>{tarefa.nome}</h3>
            <article className="conteudo">
              <p>{tarefa.descricao}</p>
              <p className="recompensa">
                Recompensa: <strong id="destaque-recompensa">{tarefa.recompensa} capibas</strong> 🪙
              </p>
            </article>
            <article className="botao-mapa" onClick={(e) => {
              e.stopPropagation();
              navigate("/mapa");
            }}>
                🗺️
            </article>
          </section>
        ))}
      </main>
    </section>
  );
}