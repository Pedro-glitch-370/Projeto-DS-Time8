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

  // Adicionar novo pino - COM DEBUG DETALHADO
  adicionarPino: async (pinoData) => {
    try {
      console.log('🔍 DEBUG ADICIONAR PINO - Dados recebidos:');
      console.log('📦 pinoData completo:', pinoData);

      // CORREÇÃO: Aceitar tanto coordinates array quanto latitude/longitude separados
      let coordinates;

      if (pinoData.coordinates && Array.isArray(pinoData.coordinates)) {
        // Formato 1: coordinates como array [lng, lat]
        coordinates = pinoData.coordinates;
        console.log('📍 Usando formato coordinates array:', coordinates);
      } else if (pinoData.latitude !== undefined && pinoData.longitude !== undefined) {
        // Formato 2: latitude e longitude separados
        coordinates = [pinoData.longitude, pinoData.latitude];
        console.log('📍 Convertendo latitude/longitude para array:', coordinates);
      } else {
        throw new Error('Formato de coordenadas inválido. Use coordinates array ou latitude/longitude separados');
      }

      console.log('📍 Coordenadas finais:', coordinates);

      // Formata os dados para o formato esperado pelo backend
      const dadosFormatados = {
        nome: pinoData.nome,
        msg: pinoData.msg,
        capibas: Number(pinoData.capibas) || 0,
        localizacao: {
          type: "Point",
          coordinates: coordinates // Array [longitude, latitude]
        }
      };

      console.log('📤 Dados formatados para envio:');
      console.log('📍 localizacao completo:', dadosFormatados.localizacao);
      console.log('📍 JSON completo:', JSON.stringify(dadosFormatados, null, 2));

      const response = await api.post('/pinos/adicionar', dadosFormatados);
      
      console.log('✅ PINO CRIADO COM SUCESSO:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ ERRO AO ADICIONAR PINO:', error);
      
      if (error.response) {
        console.error('📊 Status:', error.response.status);
        console.error('📄 Mensagem de erro:', error.response.data);
        console.error('🔗 URL:', error.response.config?.url);
        console.error('📤 Dados enviados:', error.response.config?.data);
      }
      
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

  // Atualizar pino - VOLTAR AO FORMATO ORIGINAL
  updatePino: async (pinoId, dadosAtualizados) => {
    try {
      console.log('🔄 Enviando atualização para pino:', pinoId);

      // Formata os dados corretamente para o backend CORRIGIDO
      const dadosFormatados = {
        nome: dadosAtualizados.nome,
        msg: dadosAtualizados.msg,
        capibas: Number(dadosAtualizados.capibas) || 0,
        localizacao: {
          type: "Point",
          coordinates: dadosAtualizados.coordinates // [longitude, latitude]
        }
      };

      console.log('📤 Dados formatados para PUT:', dadosFormatados);

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
  }
};