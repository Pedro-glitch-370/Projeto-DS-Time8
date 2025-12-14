import { useEffect, useState } from "react";
import "./tarefasConcluidas.css";
import { pinoService } from "../../../services/pinoService";

export default function TarefasConcluidas() {
  const [usuarioLogado, setUsuarioLogado] = useState(null); 
  const [tarefasConcluidas, setTarefasConcluidas] = useState([]);
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState(0);
  const [loading, setLoading] = useState(true);

  // Verificar login e carregar dados do usuário
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("⚠️ Você precisa estar logado para acessar suas tarefas!");
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
    return (
      <div className="sem-tarefas">
        <div className="loading-spinner-tarefas"></div>
        <h3>Carregando suas tarefas...</h3>
        <p>Aguarde enquanto buscamos seu progresso</p>
      </div>
    );
  }

  return (
    <div className="container-tarefas">
      {/* Seção de Progresso */}
      <div className="secao-progresso">
        <h2 className="titulo-progresso">📊 Seu Progresso</h2>
        <div className="stats-progresso">
          <div className="stat-item">
            <div className="stat-numero">{tarefasConcluidas.length}</div>
            <div className="stat-label">Tarefas Concluídas</div>
          </div>
          <div className="stat-item">
            <div className="stat-numero">{tarefasDisponiveis}</div>
            <div className="stat-label">Tarefas Disponíveis</div>
          </div>
          <div className="stat-item">
            <div className="stat-numero">
              {tarefasDisponiveis > 0 
                ? `${Math.round((tarefasConcluidas.length / tarefasDisponiveis) * 100)}%` 
                : "0%"
              }
            </div>
            <div className="stat-label">Taxa de Conclusão</div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="barra-progresso-container">
          <div className="barra-progresso">
            <div 
              className="barra-progresso-preenchida"
              style={{ 
                width: tarefasDisponiveis > 0 
                  ? `${(tarefasConcluidas.length / tarefasDisponiveis) * 100}%` 
                  : '0%' 
              }}
            ></div>
          </div>
          <div className="progresso-texto">
            {tarefasConcluidas.length} de {tarefasDisponiveis} tarefas concluídas
          </div>
        </div>

        {/* Mensagem Motivacional */}
        <div className="mensagem-motivacional">
          <span className="icone-motivacional">🏆</span>
          <div>
            <h3>Continue assim!</h3>
            <p>Você está no caminho certo! Continue completando tarefas para melhorar seu progresso.</p>
          </div>
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
              onClick={() => window.location.href = "/tarefas"}
            >
              Explorar Tarefas
            </button>
          </div>
        ) : (
          <div className="lista-tarefas-vertical">
            {tarefasConcluidas.map((tarefa) => (
              <div key={tarefa.id} className="tarefa-concluida-vertical">
                <div className="tarefa-numero">#{tarefa.ordem}</div>
                <div className="tarefa-conteudo">
                  <div className="tarefa-cabecalho">
                    <h3 className="tarefa-titulo">{tarefa.nome}</h3>
                    <span className="badge-concluida">Concluída</span>
                  </div>
                  <p className="tarefa-descricao">{tarefa.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}