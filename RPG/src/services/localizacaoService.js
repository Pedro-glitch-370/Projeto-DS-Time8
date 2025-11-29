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
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
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
   * Inicia o rastreamento contínuo da localização do usuário
   * @param {Function} onSuccess - Callback para quando a localização é atualizada
   * @param {Function} onError - Callback para erros
   * @returns {number} ID do watch para parar o rastreamento
   */
  iniciarRastreamento: (onSuccess, onError) => {
    if (!navigator.geolocation) {
      if (onError) onError(new Error("Geolocalização não suportada pelo navegador"));
      return null;
    }

    const opcoes = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000
    };

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            precisao: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };
          if (onSuccess) onSuccess(coords);
        },
        (error) => {
          let mensagemErro = "Erro ao rastrear localização";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              mensagemErro = "Permissão de localização negada.";
              break;
            case error.POSITION_UNAVAILABLE:
              mensagemErro = "Localização indisponível.";
              break;
            case error.TIMEOUT:
              mensagemErro = "Tempo limite para rastrear localização.";
              break;
            default:
              mensagemErro = "Erro desconhecido ao rastrear localização.";
          }
          
          if (onError) onError(new Error(mensagemErro));
        },
        opcoes
      );

      return watchId;
    } catch (error) {
      if (onError) onError(error);
      return null;
    }
  },

  /**
   * Para o rastreamento da localização
   * @param {number} watchId - ID do watch retornado por iniciarRastreamento
   */
  pararRastreamento: (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      console.log('📍 Rastreamento de localização parado');
    }
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

      const response = await api.post("/validar-localizacao/proximidade-pino", payload);
      
      console.log('✅ Validação de localização bem-sucedida:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ ERRO NA VALIDAÇÃO DE LOCALIZAÇÃO:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error("Erro ao validar localização. Tente novamente.");
    }
  }
}