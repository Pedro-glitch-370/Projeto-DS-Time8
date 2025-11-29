import { pinoService } from "../../services/pinoService";
import { authService } from "../../services/authService";

/**
 * Verifica se o usuário atual tem permissão de administrador
 * @returns {boolean} True se for admin, False caso contrário
 */
const verificarPermissaoAdmin = () => {
  if (!authService.isAdmin()) {
    alert("Apenas administradores podem realizar esta ação.");
    return false;
  }
  return true;
};

/**
 * Formata os dados do pino para o formato esperado pela API
 * @param {Object} dados - Dados brutos do pino
 * @returns {Object} Dados formatados para a API
 */
const formatarDadosPino = (dados) => ({
  nome: dados.nome,                    // Nome do ponto
  msg: dados.msg,                      // Descrição/mensagem
  capibas: Number(dados.capibas) || 0, // Recompensa em capibas (converte para número)
  latitude: dados.coordinates[1],      // Latitude (posição 1 do array [lng, lat])
  longitude: dados.coordinates[0],     // Longitude (posição 0 do array [lng, lat])
});

/**
 * Limpa os estados da UI após operação concluída
 * @param {Function} setIsSidebarOpen - Setter para abrir/fechar sidebar
 * @param {Function} setTempPin - Setter para limpar pino temporário
 * @param {Function} setSelectedPino - Setter para limpar pino selecionado
 */
const finalizarOperacao = (setIsSidebarOpen, setTempPin, setSelectedPino) => {
  setIsSidebarOpen(false);           // Fecha a sidebar
  setTempPin && setTempPin(null);    // Limpa pino temporário (se existir)
  setSelectedPino(null);             // Deseleciona pino atual
};

/**
 * Tratamento padronizado de erros para operações com pinos
 * @param {string} operacao - Nome da operação que falhou
 * @param {Error} error - Objeto de erro capturado
 */
const tratarErro = (operacao, error) => {
  console.error(`❌ Erro ao ${operacao}:`, error);
  // Tenta obter mensagem específica da API, fallback para mensagem genérica
  const message = error.response?.data?.message || `Erro ao ${operacao}`;
  alert(`Erro: ${message}`);
};

/**
 * Salva um novo pino no sistema (operação CREATE)
 * @param {Object} params - Parâmetros da operação
 * @param {Object} params.dados - Dados do pino a ser criado
 * @param {Function} params.addPino - Função para adicionar pino ao estado local
 * @param {Function} params.setIsSidebarOpen - Setter para controlar sidebar
 * @param {Function} params.setTempPin - Setter para limpar pino temporário
 * @param {Function} params.setSelectedPino - Setter para limpar seleção
 */
export async function handleSavePino({
  dados,
  addPino,
  setIsSidebarOpen,
  setTempPin,
  setSelectedPino,
}) {
  console.log("💾 Salvando pino:", dados);

  // Verifica permissão antes de prosseguir
  if (!verificarPermissaoAdmin()) return;

  try {
    // Formata dados e envia para a API
    const pinoData = formatarDadosPino(dados);
    const pinoSalvo = await pinoService.adicionarPino(pinoData);
    
    console.log("✅ Pino salvo com sucesso");
    
    // Atualiza estado local apenas se o pino tiver coordenadas válidas
    if (pinoSalvo.localizacao?.coordinates) {
      addPino(pinoSalvo);
    }
    
    // Limpa UI e mostra feedback
    finalizarOperacao(setIsSidebarOpen, setTempPin, setSelectedPino);
    alert("Ponto salvo com sucesso!");
    
  } catch (error) {
    tratarErro("salvar pino", error);
  }
}

/**
 * Remove um pino existente do sistema (operação DELETE)
 * @param {Object} params - Parâmetros da operação
 * @param {string} params.pinoId - ID do pino a ser deletado
 * @param {Function} params.removePino - Função para remover pino do estado local
 * @param {Function} params.setIsSidebarOpen - Setter para controlar sidebar
 * @param {Function} params.setSelectedPino - Setter para limpar seleção
 */
export async function handleDeletePino({
  pinoId,
  removePino,
  setIsSidebarOpen,
  setSelectedPino,
}) {
  console.log("🗑️ Deletando pino:", pinoId);

  // Verifica permissão antes de prosseguir
  if (!verificarPermissaoAdmin()) return;

  // Validação básica do ID
  if (!pinoId) {
    alert("ID do pino não encontrado");
    return;
  }

  try {
    // Remove pino da API
    await pinoService.deletarPino(pinoId);
    
    // Remove pino do estado local e limpa UI
    removePino(pinoId);
    finalizarOperacao(setIsSidebarOpen, null, setSelectedPino);
    alert("Pino deletado com sucesso! ✅");
    
  } catch (error) {
    tratarErro("deletar pino", error);
  }
}

/**
 * Atualiza um pino existente no sistema (operação UPDATE)
 * @param {Object} params - Parâmetros da operação
 * @param {string} params.pinoId - ID do pino a ser atualizado
 * @param {Object} params.dados - Novos dados do pino
 * @param {Function} params.updatePino - Função para atualizar pino no estado local
 * @param {Function} params.setIsSidebarOpen - Setter para controlar sidebar
 * @param {Function} params.setSelectedPino - Setter para limpar seleção
 */
export async function handleUpdatePino({
  pinoId,
  dados,
  updatePino,
  setIsSidebarOpen,
  setSelectedPino,
}) {
  console.log("✏️ Atualizando pino:", pinoId, dados);

  // Verifica permissão antes de prosseguir
  if (!verificarPermissaoAdmin()) return;

  try {
    // Atualiza pino via hook personalizado (que chama a API)
    await updatePino(pinoId, dados);
    
    console.log("✅ Pino atualizado com sucesso!");
    
    // Limpa UI e mostra feedback
    finalizarOperacao(setIsSidebarOpen, null, setSelectedPino);
    alert("Ponto atualizado com sucesso!");
    
  } catch (error) {
    tratarErro("atualizar pino", error);
  }
}