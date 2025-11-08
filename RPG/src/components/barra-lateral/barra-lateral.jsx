import React, { useState, useEffect } from "react";

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
    <div className="sidebar" style={styles.sidebar}>
      <div style={styles.header}>
        <h3>
          {selectedPino ? "📌 Gerenciar Ponto" : "📍 Novo Ponto de Interesse"}
        </h3>
        <button onClick={onClose} style={styles.closeButton}>
          X
        </button>
      </div>

      {tempPin && (
        <p style={styles.coordinates}>
          Coordenadas: Lat {tempPin.lat.toFixed(6)}, Lng{" "}
          {tempPin.lng.toFixed(6)}
        </p>
      )}

      {selectedPino && (
        <p style={styles.coordinates}>Pino existente: {selectedPino.nome}</p>
      )}

      <input
        type="text"
        placeholder="Nome do Local"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={styles.input}
        disabled={!!selectedPino} // Desabilita edição por enquanto
      />
      <textarea
        placeholder="Descrição/Mensagem"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        style={styles.input}
        disabled={!!selectedPino} // Desabilita edição por enquanto
      />

      <div style={styles.buttonGroup}>
        {tempPin && (
          <button onClick={handleSave} style={styles.saveButton}>
            Salvar Ponto
          </button>
        )}

        {selectedPino && (
          <button onClick={handleDelete} style={styles.deleteButton}>
            🗑️ Deletar Ponto
          </button>
        )}

        <button onClick={onClose} style={styles.cancelButton}>
          Cancelar
        </button>
      </div>

      {selectedPino && (
        <div style={styles.infoBox}>
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

// Estilos
const styles = {
  sidebar: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "350px",
    height: "100%",
    backgroundColor: "white",
    padding: "20px",
    boxShadow: "-2px 0 5px rgba(0,0,0,0.2)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
  },
  coordinates: {
    fontSize: "small",
    color: "#666",
    marginBottom: "15px",
    padding: "8px",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
  },
  input: {
    marginBottom: "10px",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  buttonGroup: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  saveButton: {
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "10px",
    backgroundColor: "#ff4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "10px",
    backgroundColor: "#666",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  infoBox: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
    fontSize: "12px",
  },
};
