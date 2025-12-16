import api from "./api.js";

// Funções auxiliares

/**
 * Formata coordenadas para o padrão esperado pela API
 * Suporta múltiplos formatos de entrada:
 * - Array [longitude, latitude] em propriedade 'coordinates'
 * - Propriedades separadas 'latitude' e 'longitude'
 * @param {Object} pinoData - Dados do pino contendo coordenadas
 * @returns {Array} Array no formato [longitude, latitude]
 * @throws {Error} Se formato das coordenadas for inválido
 */
const formatarCoordenadas = (pinoData) => {
  // Verifica se já existe array de coordinates
  if (pinoData.coordinates && Array.isArray(pinoData.coordinates)) {
    return pinoData.coordinates;
  }
  
  // Verifica se existe latitude e longitude separados
  if (pinoData.latitude !== undefined && pinoData.longitude !== undefined) {
    return [pinoData.longitude, pinoData.latitude];
  }
  
  // Lança erro se formato não for reconhecido
  throw new Error('Formato de coordenadas inválido. Use coordinates array ou latitude/longitude separados');
};

/**
 * Formata todos os dados do pino para o padrão esperado pela API
 * Garante tipos corretos e estrutura consistente
 * @param {Object} pinoData - Dados brutos do pino
 * @returns {Object} Dados formatados para a API
 */
const formatarDadosPino = (pinoData) => {
  // Formata coordenadas primeiro (pode lançar erro)
  const coordinates = formatarCoordenadas(pinoData);
  
  // Retorna objeto no formato esperado pela API
  return {
    nome: pinoData.nome,
    msg: pinoData.msg,
    capibas: Number(pinoData.capibas) || 0, // Garante que capibas seja número
    localizacao: {
      type: "Point", // Tipo GeoJSON para coordenadas
      coordinates: coordinates // [longitude, latitude]
    }
  };
};

/**
 * Registra detalhes da requisição para debugging
 * @param {string} operacao - Nome da operação sendo realizada
 * @param {Object} dados - Dados que serão enviados para a API
 */
const logRequisicao = (operacao, dados) => {
  console.log(`🔍 ${operacao} - Dados:`, dados);
  console.log(`📍 Coordenadas:`, dados.localizacao?.coordinates);
  console.log(`🪙 Capibas:`, dados.capibas); // Log específico dos capibas
};

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

// Serviço principal para gerenciamento de pinos no mapa
export const pinoService = {
  /**
   * Busca todos os pinos disponíveis no sistema
   * @returns {Promise<Array>} Lista de todos os pinos
   * @throws {Error} Em caso de falha na requisição
   */
  getPinos: async () => {
    try {
      console.log('🗺️ Buscando todos os pinos...');
      const response = await api.get('/pinos');
      console.log(`✅ Encontrados ${response.data.length} pinos`);
      return response.data;
    } catch (error) {
      logErro('BUSCAR PINOS', error);
      throw error;
    }
  },

  /**
   * Adiciona um novo pino no mapa
   * @param {Object} pinoData - Dados do pino a ser criado
   * @param {string} pinoData.nome - Nome do pino
   * @param {string} pinoData.msg - Mensagem/descrição do pino
   * @param {number} pinoData.capibas - Quantidade de capibas de recompensa
   * @param {Array|Object} pinoData.coordinates - Coordenadas do pino
   * @returns {Promise<Object>} Pino criado
   * @throws {Error} Em caso de falha na criação
   */
  adicionarPino: async (pinoData) => {
    try {
      // Formata dados para padrão da API
      const dadosFormatados = formatarDadosPino(pinoData);
      // Log dos dados que serão enviados
      logRequisicao('ADICIONAR PINO', dadosFormatados);

      // Envia requisição para API
      const response = await api.post('/pinos/adicionar', dadosFormatados);
      
      console.log('✅ PINO CRIADO COM SUCESSO');
      return response.data;

    } catch (error) {
      logErro('ADICIONAR PINO', error);
      throw error;
    }
  },

  /**
   * Remove um pino existente do sistema
   * @param {string} pinoId - ID do pino a ser deletado
   * @returns {Promise<Object>} Resposta da API
   * @throws {Error} Em caso de falha na deleção
   */
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

  /**
   * Atualiza os dados de um pino existente
   * @param {string} pinoId - ID do pino a ser atualizado
   * @param {Object} dadosAtualizados - Novos dados do pino
   * @returns {Promise<Object>} Pino atualizado
   * @throws {Error} Em caso de falha na atualização
   */
  atualizarPino: async (pinoId, dadosAtualizados) => {
    try {
      // Formata dados para padrão da API
      const dadosFormatados = formatarDadosPino(dadosAtualizados);
      // Log dos dados que serão enviados
      logRequisicao('ATUALIZAR PINO', dadosFormatados);

      // Envia requisição para API
      const response = await api.put(`/pinos/atualizar/${pinoId}`, dadosFormatados);
      
      console.log('✅ PINO ATUALIZADO COM SUCESSO');
      return response.data;

    } catch (error) {
      logErro('ATUALIZAR PINO', error);
      throw error;
    }
  }
};