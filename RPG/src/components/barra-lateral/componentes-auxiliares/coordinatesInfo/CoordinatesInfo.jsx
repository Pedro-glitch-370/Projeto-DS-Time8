export const CoordinatesInfo = ({ tempPin, selectedPino }) => {
  if (tempPin) {
    return (
      <p className="coordinates">
        <strong>Coordenadas:</strong><br></br><strong>Latitude:</strong> {tempPin.lat.toFixed(6)}<br></br><strong>Longitude:</strong> {tempPin.lng.toFixed(6)}
      </p>
    );
  }

  if (selectedPino) {
    return (
      <p className="coordinates">
        <p><strong>Modo:</strong> {selectedPino ? "Edição" : "Criação"}</p>
        <strong>Selecionado:</strong> "{selectedPino.nome}"
        <p><strong>ID:</strong> {selectedPino?._id || "Novo"}</p>
      </p>
    );
  }

  return null;
};