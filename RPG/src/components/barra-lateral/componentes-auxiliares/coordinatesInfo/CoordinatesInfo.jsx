export const CoordinatesInfo = ({ tempPin, selectedPino }) => {
  if (tempPin) {
    return (
      <p className="coordinates">
        📍 Coordenadas: Lat {tempPin.lat.toFixed(6)}, Lng {tempPin.lng.toFixed(6)}
      </p>
    );
  }

  if (selectedPino) {
    return (
      <p className="coordinates">
        📌 Editando: {selectedPino.nome}
      </p>
    );
  }

  return null;
};