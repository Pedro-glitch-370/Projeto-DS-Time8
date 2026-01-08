import { useState } from "react";
import "./tarefasCarrossel.css";
import TarefasDisponiveis from '../tarefasDisponiveis/TarefasDisponiveis'
import TarefasConcluidas from '../tarefasConcluidas/TarefasConcluidas';
import TarefasSolicitadas from '../tarefasSolicitadas/TarefasSolicitadas';
import Loading from "../../loading/Loading";

const TarefasCarrossel = () => {
    // Estado para controlar qual aba vai estar ativa no carrossel
    const [abaAtiva, setAbaAtiva] = useState('disponiveis');

    return (
        <div className="carrossel-container">
            <div className="carrossel-tabs">
                <button onClick={() => setAbaAtiva('disponiveis')} className={abaAtiva === 'disponiveis' ? 'ativo' : 'inativo'}>Disponíveis</button>
                <button onClick={() => setAbaAtiva('concluidas')} className={abaAtiva === 'concluidas' ? 'ativo' : 'inativo'}>Concluídas</button>
                <button onClick={() => setAbaAtiva('solicitadas')} className={abaAtiva === 'solicitadas' ? 'ativo' : 'inativo'}>Solicitadas</button>
            </div>

            <div className="carrossel-conteudo">
                {abaAtiva === 'disponiveis' && <TarefasDisponiveis />}
                {abaAtiva === 'concluidas' && <TarefasConcluidas />}
                {abaAtiva === 'solicitadas' && <TarefasSolicitadas />}
            </div>
        </div>
    )
}

export default TarefasCarrossel;