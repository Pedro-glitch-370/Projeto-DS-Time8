export const PinoInfo = ({ selectedPino }) => {
  if (!selectedPino) return null;

  return (
    <div className="infoBox">
      <p><strong>📋 Informações do Pino:</strong></p>
      <p><strong>ID:</strong> {selectedPino._id || selectedPino.id}</p>
      <p><strong>🪙 Capibas:</strong> {selectedPino.capibas || 0}</p>
      <p>
        <strong>📍 Coordenadas:</strong> [
        {selectedPino.localizacao?.coordinates?.[1]?.toFixed(6)},{" "}
        {selectedPino.localizacao?.coordinates?.[0]?.toFixed(6)}]
      </p>
    </div>
  );
};