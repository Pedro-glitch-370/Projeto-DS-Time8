// src/services/localizacaoService.js
import api from "./api.js";

export const localizacaoService = {
  /**
   * Solicita permissão de localização do usuário
   * @returns {Promise<Object>} Coordenadas do usuário
   */
  solicitarLocalizacao: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalização não suportada pelo navegador"));
        return;
      }

      const opcoes = {
        enableHighAccuracy: true,    // Alta precisão
        timeout: 10000,             // 10 segundos de timeout
        maximumAge: 60000           // Cache de 1 minuto
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            precisao: position.coords.accuracy
          });
        },
        (error) => {
          let mensagemErro = "Erro ao obter localização";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              mensagemErro = "Permissão de localização negada. Por favor, permita o acesso à localização para confirmar atividades.";
              break;
            case error.POSITION_UNAVAILABLE:
              mensagemErro = "Localização indisponível no momento.";
              break;
            case error.TIMEOUT:
              mensagemErro = "Tempo limite para obter localização esgotado.";
              break;
            default:
              mensagemErro = "Erro desconhecido ao obter localização.";
          }
          
          reject(new Error(mensagemErro));
        },
        opcoes
      );
    });
  },

  /**
   * Valida se o usuário está próximo do pino
   * @param {number} latitude - Latitude do usuário
   * @param {number} longitude - Longitude do usuário
   * @param {string} pinoId - ID do pino
   * @param {number} raioMaximo - Raio máximo em metros (padrão: 50m)
   * @returns {Promise<Object>} Resultado da validação
   */
  validarProximidadePino: async (latitude, longitude, pinoId, raioMaximo = 50) => {
    try {
      console.log('📍 Validando proximidade do pino:', { latitude, longitude, pinoId, raioMaximo });
      
      const payload = {
        latitudePessoa: latitude,
        longitudePessoa: longitude,
        pinoId: pinoId,
        raioMaximo: raioMaximo
      };

      const response = await api.post("/api/validar-localizacao/proximidade-pino", payload);
      return response.data;

    } catch (error) {
      console.error('❌ ERRO NA VALIDAÇÃO DE LOCALIZAÇÃO:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error("Erro ao validar localização. Tente novamente.");
    }
  },

  /**
   * Validação otimizada para múltiplos pinos próximos
   * @param {number} latitude - Latitude do usuário
   * @param {number} longitude - Longitude do usuário
   * @param {number} raioMaximo - Raio máximo em metros
   * @returns {Promise<Object>} Lista de pinos próximos
   */
  buscarPinosProximos: async (latitude, longitude, raioMaximo = 100) => {
    try {
      const payload = {
        latitudePessoa: latitude,
        longitudePessoa: longitude,
        raioMaximo: raioMaximo
      };

      const response = await api.post("/api/validar-localizacao/proximidade-otimizada", payload);
      return response.data;

    } catch (error) {
      console.error('❌ ERRO AO BUSCAR PINOS PRÓXIMOS:', error);
      throw error;
    }
  }
};