import api from "./api.js";

/**
 * Funções auxiliares para logging padronizado de erros
 * @param {string} operacao - Nome da operação que falhou
 * @param {Error} error - Objeto de erro capturado
 */
const logErro = (operacao, error) => {
  console.error(`❌ ERRO AO ${operacao}:`, error);
  // Exibe detalhes adicionais se disponíveis na resposta da API
  if (error.response) {
    console.error('📊 Status:', error.response.status);
    console.error('📄 Mensagem:', error.response.data);
  }
};

/**
 * Serviço para gerenciamento de operações relacionadas a clientes
 * Inclui busca de usuários e conclusão de tarefas com recompensas
 */
export const clienteService = {
  
  /**
   * Busca um usuário (cliente ou admin) pelo ID
   * @param {string} userId - ID único do usuário a ser buscado
   * @returns {Promise<Object>} Dados completos do usuário encontrado
   * @throws {Error} Se o usuário não for encontrado ou ocorrer erro na API
   */
  getCliente: async (userId) => {
    try {
      console.log(`👤 Buscando usuário: ${userId}`);
      // Faz requisição GET para endpoint específico do usuário
      const response = await api.get(`/auth/clientes/${userId}`);
      return response.data;
    } catch (error) {
      logErro('BUSCAR CLIENTE', error);
      throw error;
    }
  },

  /**
   * Busca um usuário (cliente ou admin) pelo endereço de email
   * @param {string} email - Email do usuário a ser buscado
   * @returns {Promise<Object>} Dados completos do usuário encontrado
   * @throws {Error} Se o usuário não for encontrado ou ocorrer erro na API
   */
  getClienteByEmail: async (email) => {
    try {
      console.log(`📧 Buscando usuário por email: ${email}`);
      // Faz requisição GET para endpoint de busca por email
      const response = await api.get(`/auth/clientes/email/${email}`);
      return response.data;
    } catch (error) {
      logErro('BUSCAR CLIENTE POR EMAIL', error);
      throw error;
    }
  },

  /**
   * Marca uma tarefa como concluída e adiciona capibas (moeda virtual) ao usuário
   * Esta função é usada exclusivamente por clientes (não admins) para ganhar recompensas
   * @param {string} clienteId - ID do cliente que está concluindo a tarefa
   * @param {string} tarefaId - ID da tarefa a ser marcada como concluída
   * @param {number} capibas - Quantidade de capibas a serem creditados ao usuário
   * @param {string} fotoLink - Link da foto (Instagram/Facebook) - opcional
   * @param {string} descricaoConclusao - Descrição do que foi feito - opcional
   * @returns {Promise<Object>} Resultado da operação com detalhes da conclusão
   * @throws {Error} Se a tarefa já foi concluída, cliente não existe ou ocorrer erro na API
   */
  concluirTarefa: async (clienteId, tarefaId, capibas, fotoLink = '', descricaoConclusao = '') => {
    try {
      console.log('🎯 Concluindo tarefa:', { 
        clienteId, 
        tarefaId, 
        capibas,
        fotoLink: fotoLink ? 'fornecida' : 'não fornecida',
        descricaoConclusao: descricaoConclusao ? 'fornecida' : 'não fornecida' 
      });
      
      // Prepara payload com tipos garantidos
      const payload = {
        tarefaId: String(tarefaId), // Garante que o ID seja string
        capibas: Number(capibas),    // Garante que capibas seja número
        fotoLink: fotoLink,          // Envia link da foto
        descricaoConclusao: descricaoConclusao // Envia descrição
      };
      
      // Faz requisição POST para endpoint de conclusão de tarefas
      const response = await api.post(`/auth/clientes/${clienteId}/tarefas/concluir`, payload);
      
      console.log('✅ Tarefa concluída com sucesso:', response.data);
      return response.data;

    } catch (error) {
      // Tratamento específico para tarefa já concluída (erro 400)
      if (error.response?.status === 400) {
        const mensagemErro = error.response?.data?.message || "Tarefa já concluída";
        console.log('⚠️ Tarefa já foi concluída:', mensagemErro);
        throw new Error(mensagemErro);
      }
      
      // Tratamento para cliente não encontrado (erro 404)
      if (error.response?.status === 404) {
        console.error('❌ Cliente não encontrado:', clienteId);
        throw new Error("Cliente não encontrado. Faça login novamente.");
      }
      
      // Log detalhado para debugging de outros tipos de erro
      console.log('❌ ERRO AO CONCLUIR TAREFA:');
      console.log('📊 Status:', error.response?.status);
      console.log('📄 Mensagem:', error.response?.data);
      
      // Cria mensagem de erro amigável para o usuário
      const mensagemErro = error.response?.data?.message || 
                          error.message || 
                          "Erro ao concluir tarefa. Tente novamente.";
      
      throw new Error(mensagemErro);
    }
  }
};