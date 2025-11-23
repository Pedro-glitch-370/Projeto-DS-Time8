import api from "/src/services/api.js";

// Funções auxiliares
const logErro = (operacao, error) => {
  console.error(`❌ ERRO AO ${operacao}:`, error);
  if (error.response) {
    console.error('📊 Status:', error.response.status);
    console.error('📄 Mensagem:', error.response.data);
  }
};

// Serviço principal - agora suporta cliente e admin
export const clienteService = {
  // Buscar usuário por ID (cliente ou admin)
  getCliente: async (userId) => {
    try {
      console.log(`👤 Buscando usuário: ${userId}`);
      const response = await api.get(`/auth/clientes/${userId}`);
      return response.data;
    } catch (error) {
      logErro('BUSCAR CLIENTE', error);
      throw error;
    }
  },

  // Buscar usuário por email (cliente ou admin)
  getClienteByEmail: async (email) => {
    try {
      console.log(`📧 Buscando usuário por email: ${email}`);
      const response = await api.get(`/auth/clientes/email/${email}`);
      return response.data;
    } catch (error) {
      logErro('BUSCAR CLIENTE POR EMAIL', error);
      throw error;
    }
  },

  // Buscar ADMIN por ID
  getAdmin: async (adminId) => {
    try {
      console.log(`👑 Buscando admin: ${adminId}`);
      const response = await api.get(`/auth/admins/${adminId}`);
      return response.data;
    } catch (error) {
      logErro('BUSCAR ADMIN', error);
      throw error;
    }
  },

  // Buscar ADMIN por email
  getAdminByEmail: async (email) => {
    try {
      console.log(`📧 Buscando admin por email: ${email}`);
      const response = await api.get(`/auth/admins/email/${email}`);
      return response.data;
    } catch (error) {
      logErro('BUSCAR ADMIN POR EMAIL', error);
      throw error;
    }
  },

  // Concluir tarefa (funciona para cliente e admin)
  concluirTarefa: async (userId, tarefaId, capibas, userType = 'cliente') => {
    try {
      console.log(`🎯 ${userType.toUpperCase()} ${userId} concluindo tarefa ${tarefaId} por ${capibas} capibas`);
      
      const endpoint = userType === 'admin' ? 'admins' : 'clientes';
      const response = await api.post(`/auth/${endpoint}/${userId}/tarefas/concluir`, {
        tarefaId,
        capibas
      });
      
      console.log(`✅ Tarefa concluída com sucesso por ${userType}`);
      return response.data;
    } catch (error) {
      logErro('CONCLUIR TAREFA', error);
      throw error;
    }
  }
};