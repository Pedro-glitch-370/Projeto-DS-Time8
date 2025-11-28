export const DebugInfo = ({ selectedPino }) => (
  <div className="debug-info">
    <p><strong>💡 Modo:</strong> {selectedPino ? "EDIÇÃO" : "CRIAÇÃO"}</p>
    <p><strong>🆔 Pino ID:</strong> {selectedPino?._id || "Novo"}</p>
  </div>
);