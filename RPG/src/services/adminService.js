// adminService.js - CORRIGIDO
import api from "/src/services/api.js";

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

export const adminService = {
  /**
   * Busca um administrador pelo ID
   * @param {string} adminId - ID do administrador a ser buscado
   * @returns {Promise<Object>} Dados do administrador encontrado
   */
  getAdmin: async (adminId) => {
    try {
      console.log(`Buscando admin: ${adminId}`);
      // Faz requisição GET para endpoint específico do admin
      const response = await api.get(`/auth/admins/${adminId}`);
      // Retorna apenas a propriedade user dos dados da resposta
      return response.data.user;
    } catch (error) {
      logErro('BUSCAR ADMIN', error);
      throw error; // Propaga o erro para o chamador
    }
  },

  /**
   * Busca um administrador pelo email
   * @param {string} email - Email do administrador a ser buscado
   * @returns {Promise<Object>} Dados do administrador encontrado
   */
  getAdminByEmail: async (email) => {
    try {
      console.log(`📧 Buscando admin por email: ${email}`);
      // Faz requisição GET para endpoint de busca por email
      const response = await api.get(`/auth/admins/email/${email}`);
      // Retorna apenas a propriedade user dos dados da resposta
      return response.data.user;
    } catch (error) {
      logErro('BUSCAR ADMIN POR EMAIL', error);
      throw error;
    }
  },

  /**
   * Permite que um administrador teste/conclua uma tarefa
   * Diferente do cliente, admin não recebe capibas por concluir tarefas
   * @param {string} adminId - ID do administrador
   * @param {string} tarefaId - ID da tarefa a ser testada
   * @returns {Promise<Object>} Resultado da operação
   */
  concluirTarefa: async (adminId, tarefaId) => {
    try {
      console.log(`👑 Admin ${adminId} testando tarefa ${tarefaId})`);
      
      // Prepara payload - admin só precisa do ID da tarefa (sem capibas)
      const payload = {
        tarefaId: String(tarefaId) // Garante que é string
      };
      
      console.log('📦 Payload admin:', payload);
      
      // Faz requisição POST para endpoint específico de admin
      const response = await api.post(`/auth/admins/${adminId}/tarefas/concluir`, payload);
      
      console.log('✅ Tarefa testada com sucesso por admin');
      return response.data;

    } catch (error) {
      // Log detalhado para debugging
      console.log('❌ ERRO AO TESTAR TAREFA (admins):');
      console.log('📊 Status:', error.response?.status);
      console.log('📄 Dados:', error.response?.data);
      throw error;
    }
  }
};