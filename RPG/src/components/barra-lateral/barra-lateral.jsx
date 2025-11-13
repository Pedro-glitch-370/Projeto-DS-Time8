import { useState, useEffect } from "react";
import "../../css/barra-lateral.css";

export default function Sidebar({
  isOpen,
  onClose,
  tempPin,
  selectedPino,
  onSave,
  onDelete,
}) {
  const [nome, setNome] = useState("");
  const [msg, setMsg] = useState("");

  // Efeito pra preencher os campos quando um pino existente é selecionado
  useEffect(() => {
    if (selectedPino) {
      setNome(selectedPino.nome || "");
      setMsg(selectedPino.msg || "");
    } else {
      setNome("");
      setMsg("");
    }
  }, [selectedPino]);

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
    } else if (selectedPino) {
      // TODO: Implementar edição de pino existente
      alert("Edição de pino ainda não implementada");
    }
  };

  const handleDelete = () => {
    if (selectedPino) {
      const pinoId = selectedPino._id || selectedPino.id;
      onDelete(pinoId);
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

      {tempPin && (
        <p className="coordinates">
          Coordenadas: Lat {tempPin.lat.toFixed(6)}, Lng{" "}
          {tempPin.lng.toFixed(6)}
        </p>
      )}

      {selectedPino && (
        <p className="coordinates">Pino existente: {selectedPino.nome}</p>
      )}

      <input
        type="text"
        placeholder="Nome do Local"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="input"
        disabled={!!selectedPino} // Desabilita edição por enquanto
      />
      <textarea
        placeholder="Descrição/Mensagem"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="input"
        disabled={!!selectedPino} // Desabilita edição por enquanto
      />

      <div className="buttonGroup">
        {tempPin && !selectedPino && (
          <button onClick={handleSave} className="saveButton">
            Salvar Ponto
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
