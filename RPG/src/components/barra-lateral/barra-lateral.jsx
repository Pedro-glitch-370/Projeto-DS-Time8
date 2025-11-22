import { useState, useEffect } from "react";
import "./barra-lateral.css";

export default function Sidebar({
  isOpen,
  onClose,
  tempPin,
  selectedPino,
  onSave,
  onDelete,
  onUpdate
}) {
  const [nome, setNome] = useState("");
  const [msg, setMsg] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);

  // Efeito pra preencher os campos quando um pino existente é selecionado
  useEffect(() => {
    if (selectedPino) {
      setNome(selectedPino.nome || "");
      setMsg(selectedPino.msg || "");
      setLat(selectedPino.localizacao?.coordinates?.[1] || "");
      setLng(selectedPino.localizacao?.coordinates?.[0] || "");
    } else if (tempPin) {
      setNome("");
      setMsg("");
      setLat(tempPin.lat || "");
      setLng(tempPin.lng || "");
    } else {
      setNome("");
      setMsg("");
      setLat("");
      setLng("");
    }
  }, [selectedPino, tempPin]);

  // Variáveis apenas para dar permissão de atualizar pino
  const originalNome = selectedPino?.nome || "";
  const originalMsg = selectedPino?.msg || "";
  const originalLat = selectedPino?.localizacao?.coordinates?.[1] || 0;
  const originalLng = selectedPino?.localizacao?.coordinates?.[0] || 0;

  const hasChanges =
  nome !== originalNome ||
  msg !== originalMsg ||
  Number(lat) !== Number(originalLat) ||
  Number(lng) !== Number(originalLng);

  const handleSave = () => {
    if (!nome || !msg) {
      alert("Preencha o nome e a mensagem.");
      return;
    }

    if (tempPin) {
      // Salvando novo pino
      onSave({
        nome: nome,
        msg: msg,
        coordinates: [tempPin.lng, tempPin.lat],
      });
    }
  };

  const handleDelete = () => {
    if (selectedPino) {
      const pinoId = selectedPino._id || selectedPino.id;
      onDelete(pinoId);
    }
  };

  // o botão da barra lateral chama essa função
  const handleUpdate = () => {
    if (!nome || !msg) {
        alert("Preencha o nome e a mensagem para atualizar.");
        return;
    }

    if (selectedPino) {
        // já passa o objeto pronto para onUpdate
        const updatedPinoData = {
            id: selectedPino._id || selectedPino.id, 
            nome: nome,
            msg: msg,
            coordinates: selectedPino.localizacao?.coordinates || null, 
        };
        onUpdate(updatedPinoData); 
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="header">
        <h3>
          {selectedPino ? "📌 Gerenciar Ponto" : "📍 Novo Ponto de Interesse"}
        </h3>
        <button onClick={onClose} className="closeButton">
          X
        </button>
      </div>

      <label className="labelInput">Nome</label>
      <input
        type="text"
        placeholder="Nome do Local"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="input"
      />
      <label className="labelInput">Descrição</label>
      <textarea
        placeholder="Descrição/Mensagem"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="input"
      />
      <label className="labelInput">Latitude</label>
      <input
        type="number"
        step="0.000001"
        placeholder="Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        className="input"
        disabled={!!selectedPino || !!tempPin}
      />
      <label className="labelInput">Longitude</label>
      <input
        type="number"
        step="0.000001"
        placeholder="Longitude"
        value={lng}
        onChange={(e) => setLng(e.target.value)}
        className="input"
        disabled={!!selectedPino || !!tempPin}
      />

      <div className="buttonGroup">
        {tempPin && !selectedPino && (
          <button onClick={handleSave} className="saveButton">
            Salvar Ponto
          </button>
        )}

        {selectedPino && (
          <button
          onClick={handleUpdate}
          className={`updateButton ${!hasChanges ? "disabled" : ""}`}
          disabled={!hasChanges}>
            Atualizar Ponto
          </button>
        )}

        {selectedPino && (
          <button onClick={handleDelete} className="deleteButton">
            Deletar Ponto
          </button>
        )}

        <button onClick={onClose} className="cancelButton">
          Cancelar
        </button>
      </div>

      {selectedPino && (
        <div className="infoBox">
          <p>
            <strong>ID:</strong> {selectedPino._id || selectedPino.id}
          </p>
          <p>
            <strong>Coordenadas:</strong> [
            {selectedPino.localizacao?.coordinates?.[1]?.toFixed(6)},{" "}
            {selectedPino.localizacao?.coordinates?.[0]?.toFixed(6)}]
          </p>
        </div>
      )}
    </div>
  );
}
