import { pinoService } from "../../services/pinoService";
import { authService } from "../../services/authService";

// Funções auxiliares
const verificarPermissaoAdmin = () => {
  if (!authService.isAdmin()) {
    alert("Apenas administradores podem realizar esta ação.");
    return false;
  }
  return true;
};

const formatarDadosPino = (dados) => ({
  nome: dados.nome,
  msg: dados.msg,
  latitude: dados.coordinates[1], // lat
  longitude: dados.coordinates[0], // lng
});

const finalizarOperacao = (setIsSidebarOpen, setTempPin, setSelectedPino) => {
  setIsSidebarOpen(false);
  setTempPin && setTempPin(null);
  setSelectedPino(null);
};

const tratarErro = (operacao, error) => {
  console.error(`❌ Erro ao ${operacao}:`, error);
  const message = error.response?.data?.message || `Erro ao ${operacao}`;
  alert(`Erro: ${message}`);
};

// Operações principais
export async function handleSavePino({
  dados,
  addPino,
  setIsSidebarOpen,
  setTempPin,
  setSelectedPino,
}) {
  console.log("💾 Salvando pino:", dados);

  if (!verificarPermissaoAdmin()) return;

  try {
    const pinoData = formatarDadosPino(dados);
    const pinoSalvo = await pinoService.adicionarPino(pinoData);
    
    console.log("✅ Pino salvo com sucesso");
    
    if (pinoSalvo.localizacao?.coordinates) {
      addPino(pinoSalvo);
    }
    
    finalizarOperacao(setIsSidebarOpen, setTempPin, setSelectedPino);
    alert("Ponto salvo com sucesso!");
    
  } catch (error) {
    tratarErro("salvar pino", error);
  }
}

export async function handleDeletePino({
  pinoId,
  removePino,
  setIsSidebarOpen,
  setSelectedPino,
}) {
  console.log("🗑️ Deletando pino:", pinoId);

  if (!verificarPermissaoAdmin()) return;

  if (!pinoId) {
    alert("ID do pino não encontrado");
    return;
  }

  try {
    await pinoService.deletarPino(pinoId);
    
    removePino(pinoId);
    finalizarOperacao(setIsSidebarOpen, null, setSelectedPino);
    alert("Pino deletado com sucesso! ✅");
    
  } catch (error) {
    tratarErro("deletar pino", error);
  }
}

export async function handleUpdatePino({
  pinoId,
  dados,
  updatePino,
  setIsSidebarOpen,
  setSelectedPino,
}) {
  console.log("✏️ Atualizando pino:", pinoId, dados);

  if (!verificarPermissaoAdmin()) return;

  try {
    await updatePino(pinoId, dados);
    
    console.log("✅ Pino atualizado com sucesso!");
    finalizarOperacao(setIsSidebarOpen, null, setSelectedPino);
    alert("Ponto atualizado com sucesso!");
    
  } catch (error) {
    tratarErro("atualizar pino", error);
  }
}