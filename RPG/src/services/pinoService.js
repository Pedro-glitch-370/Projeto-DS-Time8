import api from "/src/services/api.js";

// Funções auxiliares
const formatarCoordenadas = (pinoData) => {
  if (pinoData.coordinates && Array.isArray(pinoData.coordinates)) {
    return pinoData.coordinates;
  }
  
  if (pinoData.latitude !== undefined && pinoData.longitude !== undefined) {
    return [pinoData.longitude, pinoData.latitude];
  }
  
  throw new Error('Formato de coordenadas inválido. Use coordinates array ou latitude/longitude separados');
};

const formatarDadosPino = (pinoData) => {
  const coordinates = formatarCoordenadas(pinoData);
  
  return {
    nome: pinoData.nome,
    msg: pinoData.msg,
    capibas: Number(pinoData.capibas) || 0,
    localizacao: {
      type: "Point",
      coordinates: coordinates
    }
  };
};

const logRequisicao = (operacao, dados) => {
  console.log(`🔍 ${operacao} - Dados:`, dados);
  console.log(`📍 Coordenadas:`, dados.localizacao?.coordinates);
};

const logErro = (operacao, error) => {
  console.error(`❌ ERRO AO ${operacao}:`, error);
  
  if (error.response) {
    console.error('📊 Status:', error.response.status);
    console.error('📄 Mensagem:', error.response.data);
  }
};

// Serviço principal
export const pinoService = {
  // Buscar todos os pinos
  getPinos: async () => {
    try {
      const response = await api.get('/pinos');
      return response.data;
    } catch (error) {
      logErro('BUSCAR PINOS', error);
      throw error;
    }
  },

  // Adicionar novo pino
  adicionarPino: async (pinoData) => {
    try {
      const dadosFormatados = formatarDadosPino(pinoData);
      logRequisicao('ADICIONAR PINO', dadosFormatados);

      const response = await api.post('/pinos/adicionar', dadosFormatados);
      
      console.log('✅ PINO CRIADO COM SUCESSO');
      return response.data;

    } catch (error) {
      logErro('ADICIONAR PINO', error);
      throw error;
    }
  },

  // Deletar pino
  deletarPino: async (pinoId) => {
    try {
      console.log(`🗑️ Deletando pino: ${pinoId}`);
      
      const response = await api.delete(`/pinos/deletar/${pinoId}`);
      
      console.log('✅ PINO DELETADO COM SUCESSO');
      return response.data;

    } catch (error) {
      logErro('DELETAR PINO', error);
      throw error;
    }
  },

  // Atualizar pino
  atualizarPino: async (pinoId, dadosAtualizados) => {
    try {
      const dadosFormatados = formatarDadosPino(dadosAtualizados);
      logRequisicao('ATUALIZAR PINO', dadosFormatados);

      const response = await api.put(`/pinos/atualizar/${pinoId}`, dadosFormatados);
      
      console.log('✅ PINO ATUALIZADO COM SUCESSO');
      return response.data;

    } catch (error) {
      logErro('ATUALIZAR PINO', error);
      throw error;
    }
  }
};