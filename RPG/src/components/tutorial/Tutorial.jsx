import Particulas from "../particulas/Particulas";
import "./tutorial.css";

export default function Tutorial() {
  return (
    <>
    <div className="tutorial-container">
      <h2>Como usar esta plataforma?</h2>

      <div className="tutorial-section">
        <h3>📍 Desbloquear tarefa</h3>
        <p>
          Para desbloquear uma tarefa, você precisa estar dentro de <strong>50 metros</strong> do pino correspondente no mapa. Ao se aproximar, a tarefa ficará disponível para sua equipe.
        </p>
      </div>

      <div className="tutorial-section">
        <h3>✅ Concluir tarefa</h3>
        <p>
          Após realizar a atividade, envie uma <strong>foto</strong> e um <strong>relatório</strong> com os detalhes do que foi feito. Isso permite que a tarefa seja enviada para análise.
        </p>
      </div>

      <div className="tutorial-section">
        <h3>📝 Minhas Tarefas</h3>
        <p>
          Na aba <strong>Minhas Tarefas</strong>, você pode:
        </p>
        <ul>
          <li>Ver tarefas disponíveis próximas de você</li>
          <li>Acompanhar tarefas já concluídas</li>
          <li>Sugerir novas tarefas para sua equipe</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>🤝 Trabalho em grupo</h3>
        <p>
          As tarefas são feitas em equipe. Ao colaborar com outros usuários, você ajuda a cuidar da cidade de Recife e acumula conquistas junto com sua turma.
        </p>
      </div>
    </div>
    <Particulas />
    </>
  );
}
