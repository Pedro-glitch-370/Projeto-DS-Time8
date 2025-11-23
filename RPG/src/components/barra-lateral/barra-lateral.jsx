import { useState, useEffect } from "react";
import "./barra-lateral.css";

// =================================================================
// Componentes auxiliares
const SidebarHeader = ({ selectedPino, onClose }) => (
  <div className="header">
    <h3>
      {selectedPino ? "✏️ Editar Ponto" : "📍 Novo Ponto de Interesse"}
    </h3>
    <button onClick={onClose} className="closeButton">
      ×
    </button>
  </div>
);

const CoordinatesInfo = ({ tempPin, selectedPino }) => {
  if (tempPin) {
    return (
      <p className="coordinates">
        <p><strong>Modo:</strong> {selectedPino ? "Edição" : "Criação"}</p>
        <strong>Latitude:</strong> {tempPin.lat.toFixed(6)}<br>
        </br><strong>Longitude:</strong> {tempPin.lng.toFixed(6)}
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

const InputField = ({ label, type = "text", value, onChange, placeholder, isTextarea = false, rows = 4 }) => {
  const InputComponent = isTextarea ? "textarea" : "input";
  
  return (
    <div className="input-group">
      <label>{label}:</label>
      <InputComponent
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input ${isTextarea ? 'textarea' : ''}`}
        rows={isTextarea ? rows : undefined}
      />
    </div>
  );
};

const CapibasInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    // Permite apenas números e substitui o zero quando começar a digitar
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    
    if (inputValue === '' || inputValue === '0') {
      onChange('');
    } else {
      onChange(inputValue.replace(/^0+/, '')); // Remove zeros à esquerda
    }
  };

  const handleFocus = (e) => {
    // Se o valor for "0", limpa o campo ao focar
    if (e.target.value === '0') {
      onChange('');
    }
  };

  const handleBlur = (e) => {
    // Se o campo estiver vazio, coloca 0
    if (e.target.value === '') {
      onChange('0');
    }
  };

  return (
    <div className="input-group">
      <label>Quantidade de Capibas (Recompensa):</label>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="0"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="input"
      />
    </div>
  );
};

const ActionButtons = ({ mode, onSave, onUpdate, onDelete, onCancel, hasChanges }) => {
  const renderCreationMode = () => (
    <button onClick={onSave} className="saveButton">
      ✅ Salvar Novo Ponto
    </button>
  );

  const renderEditionMode = () => (
    <>
      <button onClick={onUpdate} className="updateButton" disabled={!hasChanges}>
        🔄 Atualizar Ponto
      </button>
      <button onClick={onDelete} className="deleteButton">
        🗑️ Excluir Ponto
      </button>
    </>
  );

  return (
    <div className="buttonGroup">
      {mode === 'creation' && renderCreationMode()}
      {mode === 'edition' && renderEditionMode()}
      <button onClick={onCancel} className="cancelButton">
        ↩️ Cancelar
      </button>
    </div>
  );
};

const PinoInfo = ({ selectedPino }) => {
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

// =================================================================
// Funções auxiliares
const validateForm = (nome, msg) => {
  if (!nome || !msg) {
    alert("Preencha o nome e a mensagem.");
    return false;
  }
  
  return true;
};

const extractCoordinates = (pino) => {
  if (pino.localizacao?.coordinates?.length === 2) {
    return pino.localizacao.coordinates;
  }
  if (pino.coordinates?.length === 2) {
    return pino.coordinates;
  }
  
  console.warn('Usando coordenadas padrão');
  return [-34.8713, -8.0631];
};

const logDebugInfo = (operation, data) => {
  console.log(`🔍 ${operation}:`, data);
};

// =================================================================
// Componente principal
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
  const [capibas, setCapibas] = useState("0");

  // Determina o modo atual
  const currentMode = selectedPino ? 'edition' : 'creation';

  // Efeito para preencher os campos quando um pino é selecionado
  useEffect(() => {
    if (selectedPino) {
      setNome(selectedPino.nome || "");
      setMsg(selectedPino.msg || "");
      setCapibas(selectedPino.capibas?.toString() || "0");
    } else {
      setNome("");
      setMsg("");
      setCapibas("0");
    }
  }, [selectedPino]);

  // Variáveis apenas para dar permissão de atualizar pino
  const originalNome = selectedPino?.nome || "";
  const originalMsg = selectedPino?.msg || "";
  const originalCapibas = selectedPino?.capibas?.toString() || "0";
  const hasChanges = nome !== originalNome || msg !== originalMsg || capibas !== originalCapibas;

  // Handlers
  const handleSave = () => {
    if (!validateForm(nome, msg)) return;

    if (tempPin) {
      logDebugInfo('SIDEBAR - Dados antes de enviar', {
        tempPin,
        lat: tempPin.lat,
        lng: tempPin.lng,
        types: `lat: ${typeof tempPin.lat}, lng: ${typeof tempPin.lng}`,
        capibas: capibas
      });

      const coordinates = [
        Number(tempPin.lng), // longitude
        Number(tempPin.lat)  // latitude
      ];

      logDebugInfo('Coordinates criado', {
        coordinates,
        isValid: Array.isArray(coordinates) && coordinates.length === 2
      });

      onSave({
        nome: nome,
        msg: msg,
        capibas: Number(capibas) || 0,
        coordinates: coordinates
      });
    }
  };

  const handleUpdate = () => {
    if (!validateForm(nome, msg)) return;

    if (selectedPino) {
      logDebugInfo('DEBUG SIDEBAR handleUpdate', {
        selectedPino,
        localizacao: selectedPino.localizacao,
        coordinates: selectedPino.localizacao?.coordinates,
        capibas: capibas
      });

      const coordinates = extractCoordinates(selectedPino);
      
      logDebugInfo('Coordenadas extraídas', {
        coordinates,
        type0: `${typeof coordinates[0]} (${coordinates[0]})`,
        type1: `${typeof coordinates[1]} (${coordinates[1]})`
      });

      onUpdate({
        nome: nome,
        msg: msg,
        capibas: Number(capibas) || 0,
        coordinates: coordinates
      });
    }
  };

  const handleDelete = () => {
    if (selectedPino && window.confirm("Tem certeza que deseja excluir este pino?")) {
      const pinoId = selectedPino._id || selectedPino.id;
      onDelete(pinoId);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleCapibasChange = (value) => {
    setCapibas(value);
  };

  // Não renderizar se não estiver aberto
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
    <SidebarHeader selectedPino={selectedPino} onClose={onClose} />
    
    <div className="sidebar-content">
      <CoordinatesInfo tempPin={tempPin} selectedPino={selectedPino} />

      <InputField
        label="Nome do Local"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Digite o nome do local"
      />

      <InputField
        label="Descrição/Mensagem"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Descreva a atividade ou informação deste local"
        isTextarea={true}
        rows={4}
      />

      <CapibasInput
        value={capibas}
        onChange={handleCapibasChange}
      />

      <PinoInfo selectedPino={selectedPino} />
    </div>

    <ActionButtons
      mode={currentMode}
      onSave={handleSave}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onCancel={handleCancel}
      hasChanges={hasChanges}
    />
  </div>
  );
}