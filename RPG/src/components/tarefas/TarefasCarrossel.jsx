import { useState } from "react";
import TarefasDisponiveis from './TarefasDisponiveis';
import TarefasConcluidas from './TarefasConcluidas';
import TarefasSolicitadas from './TarefasSolicitadas';

const TarefasCarrossel = () => {
    // Estado para controlar qual aba vai estar ativa no carrossel
    const [abaAtiva, setAbaAtiva] = useState('disponiveis');

    return (
        <div className="carrossel-container">
            <div className="carrossel-tabs">
                <button onClick={() => setAbaAtiva('disponiveis')} className={abaAtiva === 'disponiveis' ? 'ativo' : ''}>Disponíveis</button>
                <button onClick={() => setAbaAtiva('concluidas')} className={abaAtiva === 'concluidas' ? 'ativo' : ''}>Concluídas</button>
                <button onClick={() => setAbaAtiva('solicitadas')} className={abaAtiva === 'solicitadas' ? 'ativo' : ''}>Solicitadas</button>
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