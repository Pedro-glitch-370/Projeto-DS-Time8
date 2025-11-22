import { useState, useEffect } from "react";
import "./barra-lateral.css";

export default function Sidebar({
  isOpen,
  onClose,
  tempPin,
  selectedPino,
  onSave,
  onUpdate,
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
    console.log('🔍 SIDEBAR - Dados antes de enviar:');
    console.log('📍 tempPin:', tempPin);
    console.log('📍 tempPin.lat:', tempPin.lat);
    console.log('📍 tempPin.lng:', tempPin.lng);
    console.log('📍 São números?', typeof tempPin.lat, typeof tempPin.lng);

    // CORREÇÃO: Garantir que as coordenadas são um array
    const coordinates = [
      Number(tempPin.lng), // longitude
      Number(tempPin.lat)  // latitude
    ];

    console.log('📍 coordinates criado:', coordinates);
    console.log('📍 É array válido?', Array.isArray(coordinates) && coordinates.length === 2);

    // Salvando novo pino
    onSave({
      nome: nome,
      msg: msg,
      coordinates: coordinates // DEVE SER [longitude, latitude]
    });
  }
};

  const handleUpdate = () => {
  if (!nome || !msg) {
    alert("Preencha o nome e a mensagem.");
    return;
  }

  if (selectedPino) {
    // DEBUG: Verificar TODAS as possíveis localizações
    console.log('🔍 DEBUG - Estrutura completa do pino:');
    console.log('📋 Pino completo:', selectedPino);
    console.log('📍 localizacao:', selectedPino.localizacao);
    console.log('📍 coordinates:', selectedPino.localizacao?.coordinates);
    console.log('📍 lat/lng direto:', selectedPino.lat, selectedPino.lng);
    console.log('📍 latitude/longitude:', selectedPino.latitude, selectedPino.longitude);
    
    // Função para extrair coordenadas de qualquer formato
    const extractCoordinates = (pino) => {
      // Tentativa 1: Formato padrão com localizacao.coordinates
      if (pino.localizacao?.coordinates?.length === 2) {
        return pino.localizacao.coordinates;
      }
      // Tentativa 2: Coordenadas diretas
      if (pino.coordinates?.length === 2) {
        return pino.coordinates;
      }
      // Tentativa 3: Lat/Lng separados
      if (pino.lat !== undefined && pino.lng !== undefined) {
        return [pino.lng, pino.lat];
      }
      // Tentativa 4: Latitude/Longitude separados
      if (pino.latitude !== undefined && pino.longitude !== undefined) {
        return [pino.longitude, pino.latitude];
      }
      // Fallback: Coordenadas do Marco Zero do Recife
      console.warn('⚠️ Nenhuma coordenada encontrada, usando padrão');
      return [-34.8713, -8.0631];
    };

    const coordinates = extractCoordinates(selectedPino);
    console.log('📍 Coordenadas extraídas:', coordinates);

    // Atualizando pino existente
    onUpdate({
      nome: nome,
      msg: msg,
      coordinates: coordinates.map(coord => Number(coord))
    });
  }
};

  const handleDelete = () => {
    if (selectedPino) {
      if (window.confirm("Tem certeza que deseja excluir este pino?")) {
        const pinoId = selectedPino._id || selectedPino.id;
        onDelete(pinoId);
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="header">
        <h3>
          {selectedPino ? "✏️ Editar Ponto" : "📍 Novo Ponto de Interesse"}
        </h3>
        <button onClick={onClose} className="closeButton">
          ×
        </button>
      </div>

      {tempPin && (
        <p className="coordinates">
          📍 Coordenadas: Lat {tempPin.lat.toFixed(6)}, Lng{" "}
          {tempPin.lng.toFixed(6)}
        </p>
      )}

      {selectedPino && (
        <p className="coordinates">
          📌 Editando: {selectedPino.nome}
        </p>
      )}

      <div className="input-group">
        <label>Nome do Local:</label>
        <input
          type="text"
          placeholder="Digite o nome do local"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input"
        />
      </div>

      <div className="input-group">
        <label>Descrição/Mensagem:</label>
        <textarea
          placeholder="Descreva a atividade ou informação deste local"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="input textarea"
          rows="4"
        />
      </div>

      <div className="buttonGroup">
        {/* Modo CRIAÇÃO - quando tem tempPin (novo pino) */}
        {tempPin && !selectedPino && (
          <button onClick={handleSave} className="saveButton">
            ✅ Salvar Novo Ponto
          </button>
        )}

        {/* Modo EDIÇÃO - quando tem selectedPino (pino existente) */}
        {selectedPino && (
          <>
            <button onClick={handleUpdate} className="updateButton">
              🔄 Atualizar Ponto
            </button>
            <button onClick={handleDelete} className="deleteButton">
              🗑️ Excluir Ponto
            </button>
          </>
        )}

        <button onClick={onClose} className="cancelButton">
          ↩️ Cancelar
        </button>
      </div>

      {selectedPino && (
        <div className="infoBox">
          <p><strong>📋 Informações do Pino:</strong></p>
          <p><strong>ID:</strong> {selectedPino._id || selectedPino.id}</p>
          <p>
            <strong>📍 Coordenadas:</strong> [
            {selectedPino.localizacao?.coordinates?.[1]?.toFixed(6)},{" "}
            {selectedPino.localizacao?.coordinates?.[0]?.toFixed(6)}]
          </p>
        </div>
      )}

      {/* Debug info - pode remover depois */}
      <div className="debug-info">
        <p><strong>💡 Modo:</strong> {selectedPino ? "EDIÇÃO" : "CRIAÇÃO"}</p>
        <p><strong>🆔 Pino ID:</strong> {selectedPino?._id || "Novo"}</p>
      </div>
    </div>
  );
}