export const PinoInfo = ({ selectedPino }) => {
  if (!selectedPino) return null;

  return (
    <div className="infoBox">
      <label><strong>Informações do Pino:</strong></label>
      <p><strong>Latitude:</strong> {selectedPino.localizacao?.coordinates?.[1]?.toFixed(6)}</p>
      <p><strong>Longitude:</strong> {selectedPino.localizacao?.coordinates?.[0]?.toFixed(6)}</p>
      <p><strong>ID:</strong> {selectedPino?._id || "Novo"}</p>
    </div>
  );
};