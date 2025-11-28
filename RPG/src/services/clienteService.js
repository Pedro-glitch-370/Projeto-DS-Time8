import api from "./api.js";

// Funções auxiliares
/**
 * Registra erros de forma padronizada no console
 * @param {string} operacao - Nome da operação que falhou
 * @param {Error} error - Objeto de erro capturado
 */
const logErro = (operacao, error) => {
  console.error(`❌ ERRO AO ${operacao}:`, error);
  // Exibe detalhes adicionais se disponíveis na resposta
  if (error.response) {
    console.error('📊 Status:', error.response.status);
    console.error('📄 Mensagem:', error.response.data);
  }
};

// Serviço principal - agora suporta cliente e admin
export const clienteService = {
  
  /**
   * Busca um usuário (cliente ou admin) pelo ID
   * @param {string} userId - ID do usuário a ser buscado
   * @returns {Promise<Object>} Dados do usuário encontrado
   */
  getCliente: async (userId) => {
    try {
      console.log(`👤 Buscando usuário: ${userId}`);
      // Faz requisição GET para endpoint específico do usuário
      const response = await api.get(`/auth/clientes/${userId}`);
      return response.data;
    } catch (error) {
      logErro('BUSCAR CLIENTE', error);
      throw error; // Propaga o erro para o chamador
    }
  },

  /**
   * Busca um usuário (cliente ou admin) pelo email
   * @param {string} email - Email do usuário a ser buscado
   * @returns {Promise<Object>} Dados do usuário encontrado
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
   * Marca uma tarefa como concluída e adiciona capibas ao usuário
   * @param {string} clienteId - ID do cliente/admin
   * @param {string} tarefaId - ID da tarefa a ser concluída
   * @param {number} capibas - Quantidade de capibas a serem adicionados
   * @returns {Promise<Object>} Resultado da operação
   */
  concluirTarefa: async (clienteId, tarefaId, capibas) => {
    try {
      console.log('🎯 Enviando conclusão de tarefa:', { clienteId, tarefaId, capibas });
      
      // Prepara payload com tipos adequados para a API
      const payload = {
        tarefaId: String(tarefaId),    // Garante que é string
        capibas: Number(capibas)       // Garante que é número
      };
      
      // Faz requisição POST para endpoint de conclusão de tarefas
      const response = await api.post(`/auth/clientes/${clienteId}/tarefas/concluir`, payload);
      
      console.log('✅ Tarefa concluída com sucesso');
      return response.data;

    } catch (error) {
      // Tratamento específico para tarefa já concluída
      if (error.response?.status === 400 && error.response?.data?.message === 'Tarefa já concluída') {
        console.log('⚠️ Tarefa já foi concluída anteriormente, retornando dados atualizados');
        // Retorna os dados atualizados mesmo em caso de "erro"
        return error.response.data;
      }
      
      // Log detalhado para outros tipos de erro
      console.log('❌ ERRO AO CONCLUIR TAREFA:');
      console.log('📊 Status:', error.response?.status);
      console.log('📄 Mensagem:', error.response?.data);
      throw error;
    }
  }
};