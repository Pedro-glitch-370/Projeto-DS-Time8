import api from "/src/services/api.js";

// Funções auxiliares
/**
 * Registra erros de forma padronizada no console
 * @param {string} operacao - Nome da operação que falhou
 * @param {Error} error - Objeto de erro capturado
 */
const logErro = (operacao, error) => {
  console.error(`❌ ERRO AO ${operacao}:`, error);
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
      console.log(`👑 Buscando admin: ${adminId}`);
      const response = await api.get(`/auth/admins/${adminId}`);
      return response.data.user;
    } catch (error) {
      logErro('BUSCAR ADMIN', error);
      throw error;
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
      const response = await api.get(`/auth/admins/email/${email}`);
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
      console.log(`👑 Admin ${adminId} testando tarefa ${tarefaId}`);
      
      const payload = {
        tarefaId: String(tarefaId)
      };
      
      console.log('📦 Payload admin:', payload);
      
      const response = await api.post(`/auth/admins/${adminId}/tarefas/concluir`, payload);
      
      console.log('✅ Tarefa testada com sucesso por admin');
      return response.data;

    } catch (error) {
      console.log('❌ ERRO AO TESTAR TAREFA (admins):');
      console.log('📊 Status:', error.response?.status);
      console.log('📄 Dados:', error.response?.data);
      
      // Se a tarefa já foi testada, trata como sucesso condicional
      if (error.response?.data?.message?.includes('Tarefa já testada') || 
          error.response?.data?.message?.includes('já testada')) {
        console.log('ℹ️ Tarefa já foi testada anteriormente');
        return {
          message: "Tarefa já testada anteriormente",
          tarefaId: tarefaId,
          jaTestada: true,
          tarefasCompletas: error.response?.data?.tarefasCompletas || 0,
          timestamp: new Date().toISOString()
        };
      }
      
      // Se o endpoint não existir (404) ou erro 400, usa solução temporária
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log('🔄 Endpoint não disponível, usando solução temporária...');
        return await adminService._concluirTarefaFallback(adminId, tarefaId);
      }
      
      throw error;
    }
  },
};