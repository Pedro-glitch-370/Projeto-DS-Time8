import api from './api';

export const pinoService = {
  // Buscar todos os pinos
  getPinos: async () => {
    try {
      const response = await api.get('/pinos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pinos:', error);
      throw error;
    }
  },

  // Adicionar novo pino
  adicionarPino: async (pinoData) => {
    try {
      // Formata os dados para o formato esperado pelo backend
      const dadosFormatados = {
        nome: pinoData.nome,
        msg: pinoData.msg,
        latitude: pinoData.latitude,
        longitude: pinoData.longitude
      };

      const response = await api.post('/pinos/adicionar', dadosFormatados);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar pino:', error);
      throw error;
    }
  },

  // Deletar pino
  deletarPino: async (pinoId) => {
    try {
      const response = await api.delete(`/pinos/deletar/${pinoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar pino:', error);
      throw error;
    }
  },

  // Atualizar pino
  atualizarPino: async (pinoId, pinoData) => {
    try {
      const dadosFormatados = {
        nome: pinoData.nome,
        msg: pinoData.msg,
        latitude: pinoData.latitude,
        longitude: pinoData.longitude
      };

      const response = await api.put(`/pinos/atualizar/${pinoId}`, dadosFormatados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar pino:', error);
      throw error;
    }
  }
};