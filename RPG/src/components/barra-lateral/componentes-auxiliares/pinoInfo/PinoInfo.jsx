export const PinoInfo = ({ selectedPino }) => {
  if (!selectedPino) return null;

  return (
    <div className="infoBox">
      <label><strong>Coordenadas do Pino:</strong></label>
      <p>
        <strong>Latitude:</strong> {selectedPino.localizacao?.coordinates?.[1]?.toFixed(6)}<br>
        </br><strong>Longitude:</strong> {selectedPino.localizacao?.coordinates?.[0]?.toFixed(6)}
      </p>
    </div>
  );
};