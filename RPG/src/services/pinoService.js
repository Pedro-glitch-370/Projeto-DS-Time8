import api from "./api.js";

// Funções auxiliares

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
      console.log("📍📍📍 PINO SERVICE: Iniciando getPinos()");
      console.log("📍📍📍 PINO SERVICE: Fazendo requisição GET para /pinos");
      
      const response = await api.get('/pinos');
      
      console.log("📍📍📍 PINO SERVICE: Resposta recebida");
      console.log("📍📍📍 PINO SERVICE: Status:", response.status);
      console.log("📍📍📍 PINO SERVICE: Status Text:", response.statusText);
      console.log("📍📍📍 PINO SERVICE: Headers:", response.headers);
      console.log("📍📍📍 PINO SERVICE: Data:", response.data);
      console.log("📍📍📍 PINO SERVICE: Tipo de data:", typeof response.data);
      console.log("📍📍📍 PINO SERVICE: É array?", Array.isArray(response.data));
      
      if (response.data && typeof response.data === 'object') {
        console.log("📍📍📍 PINO SERVICE: Chaves do objeto:", Object.keys(response.data));
        
        // Verificar se há uma propriedade específica que contenha os pinos
        const possibleArrayKeys = Object.keys(response.data).filter(key => 
          Array.isArray(response.data[key])
        );
        console.log("📍📍📍 PINO SERVICE: Chaves que são arrays:", possibleArrayKeys);
      }
      
      // Retornar os dados diretamente - o componente vai processar
      console.log("📍📍📍 PINO SERVICE: Retornando dados para componente");
      return response.data;
      
    } catch (error) {
      console.error("📍📍📍 PINO SERVICE: ERRO NA REQUISIÇÃO:");
      console.error("📍📍📍 PINO SERVICE: Mensagem:", error.message);
      
      if (error.response) {
        console.error("📍📍📍 PINO SERVICE: Resposta do erro:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      if (error.request) {
        console.error("📍📍📍 PINO SERVICE: Request feita:", error.request);
        console.error("📍📍📍 PINO SERVICE: URL da request:", error.config?.url);
      }
      
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
      // Log dos dados que serão enviados
      logRequisicao('ADICIONAR PINO', pinoData);

      // Envia requisição para API
      const response = await api.post('/pinos/adicionar', pinoData);
      
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
      // Log dos dados que serão enviados
      logRequisicao('ATUALIZAR PINO', dadosAtualizados);

      // Envia requisição para API
      const response = await api.put(`/pinos/atualizar/${pinoId}`, dadosAtualizados);
      
      console.log('✅ PINO ATUALIZADO COM SUCESSO');
      return response.data;

    } catch (error) {
      logErro('ATUALIZAR PINO', error);
      throw error;
    }
  }
};