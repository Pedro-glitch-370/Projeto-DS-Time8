import api from "/src/services/api.js";

// Funções auxiliares
const logRequisicao = (operacao, dados) => {
  console.log(`🔍 ${operacao} - Dados:`, dados);
};

const logErro = (operacao, error) => {
  console.error(`❌ ERRO AO ${operacao}:`, error);
  if (error.response) {
    console.error('📊 Status:', error.response.status);
    console.error('📄 Mensagem:', error.response.data);
  }
};

// Serviço principal do Cliente
export const clienteService = {
  // Buscar cliente por ID
  getCliente: async (clienteId) => {
    try {
      console.log(`👤 Buscando cliente: ${clienteId}`);
      const response = await api.get(`/auth/clientes/${clienteId}`);
      return response.data;
    } catch (error) {
      logErro('BUSCAR CLIENTE', error);
      throw error;
    }
  },

  // Buscar cliente por email
  getClienteByEmail: async (email) => {
    try {
      console.log(`📧 Buscando cliente por email: ${email}`);
      const response = await api.get(`/auth/clientes/email/${email}`);
      return response.data;
    } catch (error) {
      logErro('BUSCAR CLIENTE POR EMAIL', error);
      throw error;
    }
  },

  // Concluir tarefa
  concluirTarefa: async (clienteId, tarefaId, capibas) => {
    try {
      const dados = {
        tarefaId: tarefaId,
        capibas: capibas
      };
      
      logRequisicao('CONCLUIR TAREFA', dados);
      
      // Se você já tem uma rota específica para tarefas
      const response = await api.post(`/auth/clientes/${clienteId}/tarefas/concluir`, dados);
      
      console.log('✅ TAREFA CONCLUÍDA COM SUCESSO');
      return response.data;

    } catch (error) {
      logErro('CONCLUIR TAREFA', error);
      throw error;
    }
  },

  // Buscar tarefas concluídas do cliente
  getTarefasConcluidas: async (clienteId) => {
    try {
      console.log(`📋 Buscando tarefas do cliente: ${clienteId}`);
      const response = await api.get(`/auth/clientes/${clienteId}/tarefas`);
      return response.data;
    } catch (error) {
      logErro('BUSCAR TAREFAS CLIENTE', error);
      throw error;
    }
  },

  // Atualizar dados do cliente (para capibas e tarefasCompletas)
  atualizarCliente: async (clienteId, dadosAtualizados) => {
    try {
      logRequisicao('ATUALIZAR CLIENTE', dadosAtualizados);
      
      const response = await api.put(`/auth/clientes/${clienteId}`, dadosAtualizados);
      
      console.log('✅ CLIENTE ATUALIZADO COM SUCESSO');
      return response.data;

    } catch (error) {
      logErro('ATUALIZAR CLIENTE', error);
      throw error;
    }
  }
};