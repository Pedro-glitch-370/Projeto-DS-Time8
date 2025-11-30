import api from "./api.js";

export const localizacaoService = {
  /**
   * Solicita permissão de localização com fallbacks melhorados
   */
  solicitarLocalizacao: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalização não suportada pelo navegador"));
        return;
      }

      // Configurações otimizadas
      const opcoesHighAccuracy = {
        enableHighAccuracy: true,
        timeout: 15000, // ✅ Aumentado para 15s para melhor captura GPS
        maximumAge: 0
      };

      const opcoesLowAccuracy = {
        enableHighAccuracy: false, // Prioriza velocidade sobre precisão
        timeout: 15000,
        maximumAge: 60000 // Aceita localização de até 1 minuto atrás
      };

      console.log('📍 Solicitando localização (alta precisão)...');

      // Primeira tentativa: alta precisão
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('🎯 Localização obtida com alta precisão!');
          
          // ✅ NOVO: Valida se coordenadas são plausíveis para Recife
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            precisao: position.coords.accuracy,
            metodo: 'gps'
          };
          
          if (localizacaoService.validarCoordenadasRecife(coords.latitude, coords.longitude)) {
            resolve(coords);
          } else {
            console.warn('⚠️ Coordenadas fora de Recife, usando fallback...', coords);
            // ✅ FALLBACK: Tenta obter localização por IP
            localizacaoService.obterLocalizacaoPorIP()
              .then(resolve)
              .catch(() => resolve(coords)); // Se IP falhar, usa GPS mesmo fora de área
          }
        },
        (errorHighAccuracy) => {
          console.warn('⚠️ Falha na alta precisão, tentando baixa precisão...', errorHighAccuracy);
          
          // Segunda tentativa: baixa precisão (fallback)
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('🎯 Localização obtida com baixa precisão!');
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                precisao: position.coords.accuracy,
                metodo: 'gps_low_accuracy'
              });
            },
            (errorLowAccuracy) => {
              console.error('❌ Todas as tentativas de geolocalização falharam:', errorLowAccuracy);
              
              // ✅ FALLBACK: Tenta localização por IP como último recurso
              console.log('🔄 Tentando fallback por IP...');
              localizacaoService.obterLocalizacaoPorIP()
                .then(resolve)
                .catch(() => {
                  // Se tudo falhar, retorna erro original
                  let mensagemErro;
                  switch(errorLowAccuracy.code) {
                    case errorLowAccuracy.PERMISSION_DENIED:
                      mensagemErro = "Permissão de localização negada. Por favor, permita o acesso à localização nas configurações do seu navegador.";
                      break;
                    case errorLowAccuracy.POSITION_UNAVAILABLE:
                      mensagemErro = "Localização indisponível. Verifique sua conexão e tente novamente.";
                      break;
                    case errorLowAccuracy.TIMEOUT:
                      mensagemErro = "Tempo esgotado para obter localização. Verifique se o GPS está ativo e tente novamente.";
                      break;
                    default:
                      mensagemErro = "Erro ao obter localização. Tente novamente.";
                  }
                  
                  reject(new Error(mensagemErro));
                });
            },
            opcoesLowAccuracy
          );
        },
        opcoesHighAccuracy
      );
    });
  },

  /**
   * ✅ NOVO: Obter localização por IP como fallback
   */
  obterLocalizacaoPorIP: async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      console.log('📍 Localização por IP obtida:', data);
      
      return {
        latitude: data.latitude || -8.063163, // Fallback para Recife central
        longitude: data.longitude || -34.871139,
        precisao: 5000, // Baixa precisão para IP
        cidade: data.city,
        regiao: data.region,
        metodo: 'ip_fallback',
        source: 'ip'
      };
    } catch (error) {
      console.error('❌ Erro ao obter localização por IP:', error);
      throw new Error("Não foi possível obter localização por IP");
    }
  },

  /**
   * ✅ NOVO: Validar se coordenadas são plausíveis para Recife
   */
  validarCoordenadasRecife: (lat, lng) => {
    // Limites aproximados de Recife e região metropolitana
    const RECIFE_BOUNDS = {
      minLat: -8.3,   // Sul
      maxLat: -7.9,   // Norte  
      minLng: -35.1,  // Oeste
      maxLng: -34.8   // Leste
    };
    
    const isValid = (
      lat >= RECIFE_BOUNDS.minLat &&
      lat <= RECIFE_BOUNDS.maxLat &&
      lng >= RECIFE_BOUNDS.minLng &&
      lng <= RECIFE_BOUNDS.maxLng
    );
    
    console.log('📍 Validação coordenadas Recife:', { lat, lng, isValid });
    return isValid;
  },

  /**
   * Verifica se a geolocalização está disponível e se há permissão
   */
  verificarDisponibilidade: async () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ disponivel: false, motivo: "Navegador não suporta geolocalização" });
        return;
      }

      // Verifica permissão (não é 100% confiável em todos os navegadores)
      navigator.permissions?.query({ name: 'geolocation' })
        .then((permissionStatus) => {
          resolve({
            disponivel: permissionStatus.state !== 'denied',
            permissao: permissionStatus.state,
            motivo: permissionStatus.state === 'denied' ? 'Permissão negada' : 'Disponível'
          });
        })
        .catch(() => {
          // Fallback se a API de permissions não estiver disponível
          resolve({ disponivel: true, permissao: 'unknown', motivo: 'Verificação de permissão indisponível' });
        });
    });
  },

  /**
   * INICIA RASTREAMENTO CONTÍNUO
   */
  iniciarRastreamento: (onSuccess, onError, opcoes = {}) => {
    if (!navigator.geolocation) {
      if (onError) onError(new Error("Geolocalização não suportada"));
      return null;
    }

    const opcoesPadrao = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 30000,
      ...opcoes
    };

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            precisao: position.coords.accuracy,
            timestamp: position.timestamp
          };
          console.log('📍 Localização atualizada (rastreamento):', coords);
          if (onSuccess) onSuccess(coords);
        },
        (error) => {
          console.warn('⚠️ Erro no rastreamento:', error);
          
          let mensagem = "Rastreamento interrompido";
          if (error.code === error.TIMEOUT) {
            mensagem = "Timeout no rastreamento - continuando tentativas";
            // Não chamamos onError para timeouts, pois o watchPosition continua tentando
            return;
          }
          
          if (onError) onError(new Error(mensagem));
        },
        opcoesPadrao
      );

      console.log('📍 Rastreamento iniciado com ID:', watchId);
      return watchId;

    } catch (error) {
      console.error('❌ Erro ao iniciar rastreamento:', error);
      if (onError) onError(error);
      return null;
    }
  },

  /**
   * PARA O RASTREAMENTO
   */
  pararRastreamento: (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      console.log('📍 Rastreamento parado');
    }
  },

  /**
   * Obtém localização com fallback para IP se disponível
   */
  obterLocalizacaoComFallback: async () => {
    try {
      // Primeiro tenta geolocalização precisa
      return await localizacaoService.solicitarLocalizacao();
    } catch (error) {
      console.warn('⚠️ Geolocalização falhou, tentando fallback...', error);
      
      // Poderia adicionar fallback para geolocalização por IP aqui
      // throw new Error("Não foi possível obter a localização precisa");
      
      throw error; // Mantém o erro original por enquanto
    }
  },

  /**
   * Valida proximidade com um pino específico
   */
  validarProximidadePino: async (latitude, longitude, pinoId, raioMaximo = 50) => {
    try {
      console.log('📍 Validando proximidade...');
      
      const payload = {
        latitudeUsuario: latitude,
        longitudeUsuario: longitude,
        pinoId: pinoId,
        raioMaximo: raioMaximo
      };

      const response = await api.post("/validar-localizacao/proximidade-pino", payload);
      return response.data;

    } catch (error) {
      console.error('❌ Erro na validação:', error);
      throw new Error(error.response?.data?.message || "Erro ao validar localização.");
    }
  }
};