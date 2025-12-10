export default function TarefasSolicitadas() {
    return (
        <>
            <h1>📋 Minhas Tarefas</h1>
            <div
            className="user-info"
            id="userInfo"
            style={{ textAlign: "center", marginBottom: "20px", color: "white" }}
            >
                <div style={{ display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap" }} >
                    <div className="stat-card">
                        <span style={{ fontSize: "1.1rem" }}>
                        <span id="userTarefasCompletas">0</span> tarefas disponíveis
                        </span>
                    </div>
                </div>
            </div>

            <div className="lista-tarefas" id="listaTarefas">
                <div className="sem-tarefas" id="semTarefas">
                <h3>Carregando tarefas...</h3>
                <p>Aguarde enquanto buscamos tarefas</p>
                </div>
            </div>

            <div id="popupTarefa" className="popup-tarefa">
                <div className="popup-tarefa-content">
                    {/*onClick={fecharPopupTarefa()}*/}
                    <span className="close-popup">&times;</span>
                    
                    <div className="popup-header">
                    <h2>🎯 Confirmar Tarefa</h2>
                    </div>
                    
                    <div className="popup-info">

                        <div className="info-item">
                            <span className="info-label">📍 Local:</span>
                            <span className="info-value" id="popupLocal">Carregando...</span>
                        </div>
                    
                        <div className="info-item">
                            <span className="info-label">💰 Recompensa:</span>
                            <span className="info-value" id="popupCapibas">0 capibas</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">📝 Tarefa:</span>
                            <span className="info-value" id="popupDescricao">Carregando descrição...</span>
                        </div>
                    </div>
                    

                    <div className="popup-actions">
                        {/*onClick={fecharPopupTarefa()}*/}
                        <button className="btn-cancelar" >
                            Cancelar
                        </button>
                        {/*onClick={concluirTarefa()}*/}
                        <button className="btn-concluir">
                            ✅ Confirmar Conclusão
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}