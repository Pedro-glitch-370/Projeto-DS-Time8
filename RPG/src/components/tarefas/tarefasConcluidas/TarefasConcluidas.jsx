import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/ExportsContext";
import "./tarefasConcluidas.css";
import { pinoService } from "../../../services/pinoService";
import LoadingMenor from "../../loading/LoadingMenor";

export default function TarefasConcluidas() {
  const { usuarioLogado } = useUser(); 
  const [tarefasConcluidas, setTarefasConcluidas] = useState([]);
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ativa, setAtiva] = useState(null);

  const toggleTarefa = (id) => {
    setAtiva(ativa === id ? null : id);
  };

  const navigate = useNavigate();

  // Carregar tarefas da API
  useEffect(() => {
    async function carregarTarefas() {
      try {
        const pinos = await pinoService.getPinos();
        const concluidasIds = usuarioLogado?.tarefasConcluidas || [];
        
        // Total de tarefas disponíveis
        setTarefasDisponiveis(pinos.length);

        // Filtrar apenas as tarefas concluídas
        const concluidas = pinos
          .filter(pino => concluidasIds.includes(pino._id))
          .map((pino, index) => ({
            id: pino._id,
            nome: pino.nome,
            descricao: pino.msg,
            concluida: true,
            ordem: index + 1
          }));

        setTarefasConcluidas(concluidas);
      } catch (error) {
        console.error("❌ Erro ao carregar tarefas:", error);
      } finally {
        setLoading(false);
      }
    }

    if (usuarioLogado) carregarTarefas();
  }, [usuarioLogado]);

  if (loading) {
    return <LoadingMenor />
  }

  return (
    <div className="container-tarefas">
      {/* Seção de Progresso */}
      <div className="secao-progresso">
        <h2 className="titulo-progresso">📊 Seu Progresso</h2>
        <div className="stats-progresso">
          <div className="stat-item">
            <div className="stat-numero">{tarefasConcluidas.length}</div>
            <div className="stat-label-concluidas">Tarefas Concluídas</div>
          </div>
          <div className="stat-item">
            <div className="stat-numero">{tarefasDisponiveis}</div>
            <div className="stat-label-concluidas">Tarefas Disponíveis</div>
          </div>
          <div className="stat-item">
            <div className="stat-numero">
              {tarefasDisponiveis > 0 
                ? `${Math.round((tarefasConcluidas.length / tarefasDisponiveis) * 100)}%` 
                : "0%"
              }
            </div>
            <div className="stat-label-concluidas">Taxa de Conclusão</div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="barra-progresso-container">
          <div className="mensagem-motivacional">
            <div>
              <h3>
                {tarefasConcluidas.length > 0 ? "Continue assim!" : "Tá na hora de explorar!"}
              </h3>
              <p className="progresso-texto">
                {tarefasConcluidas.length > 0
                  ? `Você está no caminho certo: ${tarefasConcluidas.length} de ${tarefasDisponiveis} tarefas concluídas.`
                  : "Comece chamando seus amigos e procurando por uma tarefa próxima."}
              </p>
            </div>
          </div>

          <div className="barra-progresso">
            <div
              className="barra-progresso-preenchida"
              style={{
                width:
                  tarefasDisponiveis > 0
                    ? `${(tarefasConcluidas.length / tarefasDisponiveis) * 100}%`
                    : "0%",
              }}
            ></div>
          </div>

          <p className="progresso-texto">
            Continue completando tarefas para melhorar seu progresso!
          </p>
        </div>
      </div>

      {/* Lista de Tarefas Concluídas */}
      <div className="secao-tarefas-concluidas">
        <h2 className="titulo-tarefas">✅ Tarefas Concluídas</h2>
        
        {tarefasConcluidas.length === 0 ? (
          <div className="sem-tarefas-concluidas">
            <div className="icone-vazio">📭</div>
            <h3>Nenhuma tarefa concluída ainda</h3>
            <p>Comece a completar tarefas para ver seu histórico aqui!</p>
            <button 
              className="btn-explorar"
              onClick={() => navigate("/mapa")}
            >
              Explorar Tarefas
            </button>
          </div>
        ) : (
          <div className="lista-tarefas-vertical">
            {tarefasConcluidas.map((tarefa) => (
              <div
                key={tarefa.id}
                className={`tarefa-concluida-vertical ${ativa === tarefa.id ? "ativa" : ""}`}
                onClick={() => toggleTarefa(tarefa.id)}
              >
                
                <div className="tarefa-conteudo">
                  <div className="tarefa-cabecalho">
                    <h3 className="tarefa-titulo">{tarefa.nome}</h3>
                    <span className="tarefa-numero">#{tarefa.ordem}</span>
                  </div>
                  <div className="conteudo-concluida">
                    <p className="tarefa-descricao">{tarefa.descricao}</p>
                    <p></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}