import { useState, useEffect } from "react";
import "./barraLateral.css";
import { validateForm, extractCoordinates, logDebugInfo } from "./funcoes-auxiliares";
import { SidebarHeader, InputField, CapibasInput,
  ActionButtons, PinoInfo } from "./componentes-auxiliares/componentesAux";

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
    <div className="sidebar">
    <SidebarHeader selectedPino={selectedPino} onClose={onClose} />
    
    <div className="sidebar-content">
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
  )
}