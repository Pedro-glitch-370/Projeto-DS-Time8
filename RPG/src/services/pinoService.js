import api from "/src/services/api.js";

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
        localizacao: {
          type: "Point",
          coordinates: pinoData.coordinates
        }
      };

      console.log('📤 Enviando dados para criação:', dadosFormatados);
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

  // Atualizar pino - VERSÃO SIMPLIFICADA
  // Atualizar pino - COM MAIS LOGS
updatePino: async (pinoId, dadosAtualizados) => {
  try {
    console.log('🔄 Enviando atualização para pino:', pinoId);
    console.log('📝 Dados recebidos no service:', dadosAtualizados);
    console.log('📍 Coordenadas no service:', dadosAtualizados.coordinates);
    console.log('📍 Tipo das coordenadas:', 
      typeof dadosAtualizados.coordinates?.[0], 
      typeof dadosAtualizados.coordinates?.[1]
    );

    // Formata os dados corretamente para o backend
    const dadosFormatados = {
      nome: dadosAtualizados.nome,
      msg: dadosAtualizados.msg,
      localizacao: {
        type: "Point",
        coordinates: [
          Number(dadosAtualizados.coordinates[0]), // Garante que é número
          Number(dadosAtualizados.coordinates[1])  // Garante que é número
        ]
      }
    };

    console.log('📤 Dados formatados para PUT:', dadosFormatados);
    console.log('📍 Coordenadas formatadas:', dadosFormatados.localizacao.coordinates);

    const response = await api.put(`/pinos/atualizar/${pinoId}`, dadosFormatados);
    
    console.log('✅ Resposta da atualização:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Erro no serviço ao atualizar pino:', error);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Dados do erro:', error.response.data);
      throw new Error(error.response.data.message || `Erro ${error.response.status}`);
    }
    throw error;
  }
}}