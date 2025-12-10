export default function TarefasSolicitadas() {
    return (
        <>
            <h1>📋 Minhas Tarefas</h1>
            <div class="user-info" id="userInfo" style="text-align: center; margin-bottom: 20px; color: white;">
                <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
                    <div class="stat-card">
                        <span style="font-size: 1.1rem;">
                        <span id="userTarefasCompletas">0</span> tarefas disponíveis
                        </span>
                    </div>
                </div>
            </div>

            <div class="lista-tarefas" id="listaTarefas">
                <div class="sem-tarefas" id="semTarefas">
                <h3>Carregando tarefas...</h3>
                <p>Aguarde enquanto buscamos tarefas</p>
                </div>
            </div>

            <div id="popupTarefa" class="popup-tarefa">
                <div class="popup-tarefa-content">
                    <span class="close-popup" onclick="fecharPopupTarefa()">&times;</span>
                    
                    <div class="popup-header">
                    <h2>🎯 Confirmar Tarefa</h2>
                    </div>
                    
                    <div class="popup-info">

                        <div class="info-item">
                            <span class="info-label">📍 Local:</span>
                            <span class="info-value" id="popupLocal">Carregando...</span>
                        </div>
                    
                        <div class="info-item">
                            <span class="info-label">💰 Recompensa:</span>
                            <span class="info-value" id="popupCapibas">0 capibas</span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">📝 Tarefa:</span>
                            <span class="info-value" id="popupDescricao">Carregando descrição...</span>
                        </div>
                    </div>
                    

                    <div class="popup-actions">
                        <button class="btn-cancelar" onclick="fecharPopupTarefa()">
                            Cancelar
                        </button>
                        <button class="btn-concluir" onclick="concluirTarefa()">
                            ✅ Confirmar Conclusão
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
