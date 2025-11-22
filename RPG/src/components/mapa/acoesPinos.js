import { pinoService } from "../../services/pinoService";
import { authService } from "../../services/authService";

// Função pra salvar o pino
export async function handleSavePino({
  dados,
  addPino,
  setIsSidebarOpen,
  setTempPin,
  setSelectedPino,
}) {
  console.log("💾 Salvando pino:", dados);

  // Verifica se é admin
  if (!authService.isAdmin()) {
    alert("Apenas administradores podem adicionar pinos.");
    return;
  }

  const pinoData = {
    nome: dados.nome,
    msg: dados.msg,
    latitude: dados.coordinates[1], // lat
    longitude: dados.coordinates[0], // lng
  };

  try {
    // Usa o pinoService em vez do api diretamente
    const pinoSalvo = await pinoService.adicionarPino(pinoData);
    console.log("✅ Pino salvo:", pinoSalvo);
    
    if (pinoSalvo.localizacao?.coordinates) {
      addPino(pinoSalvo);
    }
    
    setIsSidebarOpen(false);
    setTempPin(null);
    setSelectedPino(null);
    alert("Ponto salvo com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao salvar pino:", error);
    const message = error.response?.data?.message || "Erro ao salvar pino";
    alert(`Erro ao salvar: ${message}`);
  }
}

// =================================================================
// Função pra deletar pino
export async function handleDeletePino({
  pinoId,
  removePino,
  setIsSidebarOpen,
  setSelectedPino,
}) {
  console.log("🗑️ Deletando pino:", pinoId);

  // Verifica se é admin
  if (!authService.isAdmin()) {
    alert("Apenas administradores podem deletar pinos.");
    return;
  }

  if (!pinoId) {
    alert("ID do pino não encontrado");
    return;
  }

  const confirmacao = window.confirm(
    "Tem certeza que deseja deletar este pino?"
  );
  if (!confirmacao) return;

  try {
    // Usa o pinoService em vez do api diretamente
    await pinoService.deletarPino(pinoId);
    
    removePino(pinoId);
    setIsSidebarOpen(false);
    setSelectedPino(null);
    alert("Pino deletado com sucesso! ✅");
  } catch (error) {
    console.error("❌ Erro ao deletar pino:", error);
    const message = error.response?.data?.message || "Erro ao deletar pino";
    alert(`Erro ao deletar: ${message}`);
  }
}

// =================================================================
// Função pra atualizar pino
export async function handleUpdatePino({
  pinoId,
  dados,
  updatePino,
  setIsSidebarOpen,
  setSelectedPino,
}) {
  console.log("✏️ Atualizando pino:", pinoId, dados);

  // Verifica se é admin
  if (!authService.isAdmin()) {
    alert("Apenas administradores podem atualizar pinos.");
    return;
  }

  const pinoData = {
    nome: dados.nome,
    msg: dados.msg,
    latitude: dados.coordinates[1], // lat
    longitude: dados.coordinates[0], // lng
  };

  try {
    // Usa o pinoService
    const pinoAtualizado = await pinoService.atualizarPino(pinoId, pinoData);
    console.log("✅ Pino atualizado:", pinoAtualizado);
    
    if (updatePino) {
      updatePino(pinoId, pinoAtualizado);
    }
    
    setIsSidebarOpen(false);
    setSelectedPino(null);
    alert("Ponto atualizado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao atualizar pino:", error);
    const message = error.response?.data?.message || "Erro ao atualizar pino";
    alert(`Erro ao atualizar: ${message}`);
  }
}

// =================================================================
// Função pra clicar em um pino existente
export function handlePinoClick(pino, setSelectedPino, setIsSidebarOpen) {
  // Apenas admins podem editar, mas qualquer um pode ver informações
  if (authService.isAdmin()) {
    setSelectedPino(pino);
    setIsSidebarOpen(true);
  }
  // Se não for admin, pode mostrar informações básicas se quiser
  // ou simplesmente não fazer nada (o popup já mostra as informações)
}