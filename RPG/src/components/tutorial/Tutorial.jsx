import { useState } from "react";
import Particulas from "../particulas/Particulas";
import "./tutorial.css";

export default function Tutorial() {
  const [ativa, setAtiva] = useState(null);

  const toggleSecao = (id) => {
    setAtiva(ativa === id ? null : id);
  };

  return (
    <>
      <div className="tutorial-container">
        <h2>Como usar esta plataforma?</h2>

        <div className={`tutorial-section ${ativa === 1 ? "ativa" : ""}`} onClick={() => toggleSecao(1)}>
          <h3>📍 Desbloquear tarefa</h3>
          <div className="conteudo">
            <p>Para desbloquear uma tarefa, você precisa estar dentro de <strong>50 metros</strong> do pino correspondente no mapa. Ao se aproximar, a tarefa ficará disponível para sua equipe.</p>
          </div>
        </div>

        <div className={`tutorial-section ${ativa === 2 ? "ativa" : ""}`} onClick={() => toggleSecao(2)}>
          <h3>✅ Concluir tarefa</h3>
          <div className="conteudo">
            <p>Após realizar a atividade, envie uma <strong>foto</strong> e um <strong>relatório</strong> com os detalhes do que foi feito. Isso permite que a tarefa seja enviada para análise.</p>
          </div>
        </div>

        <div className={`tutorial-section ${ativa === 3 ? "ativa" : ""}`} onClick={() => toggleSecao(3)}>
          <h3>📝 Gerenciar Tarefas</h3>
          <div className="conteudo">
            <p>Na aba <strong>Minhas Tarefas</strong>, você pode:</p>
            <ul>
              <li>Ver tarefas disponíveis próximas de você</li>
              <li>Acompanhar tarefas já concluídas</li>
              <li>Sugerir novas tarefas para sua equipe</li>
            </ul>
          </div>
        </div>

        <div className={`tutorial-section ${ativa === 4 ? "ativa" : ""}`} onClick={() => toggleSecao(4)}>
          <h3>🤝 Trabalho em grupo</h3>
          <div className="conteudo">
            <p>As tarefas são feitas, de preferência, em <strong>equipe</strong>. Ao colaborar com outros usuários, você pode coletar <strong>mais Capibas</strong> e cuidar ainda mais da sua cidade!</p>
          </div>
        </div>
      </div>
      <Particulas />
    </>
  );
}
