const geolib = require('geolib');
const Pino = require('../models/pinoModel.js');

/**
 * VALIDA SE UMA PESSOA ESTÁ PRÓXIMA DE UM PINO ESPECÍFICO
 * Usa geolib para cálculos precisos de distância
 */
const validarProximidadePino = async (req, res) => {
    try {
        // Extrai dados do corpo da requisição
        const { 
            latitudeUsuario,     // Latitude da pessoa
            longitudeUsuario,    // Longitude da pessoa  
            pinoId,              // ID do pino específico
            raioMaximo = 50      // Raio máximo em metros (padrão: 50m)
        } = req.body;

        console.log('📍 Dados recebidos para validação:', { 
            latitudeUsuario, 
            longitudeUsuario, 
            pinoId, 
            raioMaximo 
        });

        // VALIDAÇÃO 1: Campos obrigatórios
        if (!latitudeUsuario || !longitudeUsuario || !pinoId) {
            return res.status(400).json({ 
                valid: false, 
                message: "Coordenadas e ID do pino são obrigatórios." 
            });
        }

        // VALIDAÇÃO 2: Converte para números
        const latUsuario = parseFloat(latitudeUsuario);
        const lngUsuario = parseFloat(longitudeUsuario);
        
        if (isNaN(latUsuario) || isNaN(lngUsuario)) {
            return res.status(400).json({ 
                valid: false, 
                message: "Coordenadas devem ser números válidos." 
            });
        }

        // VALIDAÇÃO 3: Coordenadas válidas globalmente
        const isValidLatitude = latUsuario >= -90 && latUsuario <= 90;
        const isValidLongitude = lngUsuario >= -180 && lngUsuario <= 180;

        if (!isValidLatitude || !isValidLongitude) {
            return res.status(400).json({ 
                valid: false, 
                message: "Coordenadas fora dos intervalos válidos (Lat: -90 a 90, Lng: -180 a 180)." 
            });
        }

        // ✅ NOVO: Validação adicional para coordenadas de Recife
        const isValidRecifeCoords = 
            latUsuario >= -8.3 && latUsuario <= -7.9 &&
            lngUsuario >= -35.1 && lngUsuario <= -34.8;

        if (!isValidRecifeCoords) {
            console.warn('⚠️ Coordenadas fora da área de Recife:', { latUsuario, lngUsuario });
        }

        // BUSCA O PINO NO BANCO
        const pino = await Pino.findById(pinoId);
        if (!pino) {
            return res.status(404).json({ 
                valid: false, 
                message: "Pino não encontrado." 
            });
        }

        console.log('📍 Pino encontrado:', {
            id: pino._id,
            nome: pino.nome,
            coords: pino.localizacao.coordinates
        });

        // PREPARA AS COORDENADAS PARA GEOLIB
        const localizacaoUsuario = {
            latitude: latUsuario,
            longitude: lngUsuario
        };

        // ✅ CORRIGIDO: Ordem das coordenadas - GeoJSON usa [longitude, latitude]
        const localizacaoPino = {
            latitude: pino.localizacao.coordinates[1], // ✅ Latitude na posição 1 (CORRETO)
            longitude: pino.localizacao.coordinates[0]  // ✅ Longitude na posição 0 (CORRETO)
        };

        console.log('📍 Coordenadas para cálculo:', {
            usuario: localizacaoUsuario,
            pino: localizacaoPino
        });

        // CÁLCULO DA DISTÂNCIA COM GEOLIB (EM METROS)
        const distanciaMetros = geolib.getDistance(localizacaoUsuario, localizacaoPino);
        
        console.log(`📏 Distância calculada com geolib: ${distanciaMetros}m`);

        // VERIFICA SE ESTÁ DENTRO DO RAIO PERMITIDO
        const estaProximo = distanciaMetros <= raioMaximo;

        // RESPOSTA DETALHADA
        const resposta = {
            valid: estaProximo,
            message: estaProximo ? 
                "✅ Você está dentro da área permitida!" : 
                `❌ Você está a ${distanciaMetros}m do local. Aproxime-se!`,
            distancia: {
                metros: distanciaMetros,
                quilometros: (distanciaMetros / 1000).toFixed(3),
                interpretacao: getInterpretacaoDistancia(distanciaMetros)
            },
            limites: {
                raioMaximoMetros: raioMaximo,
                raioMaximoKm: (raioMaximo / 1000).toFixed(1)
            },
            localizacoes: {
                usuario: localizacaoUsuario,
                pino: {
                    ...localizacaoPino,
                    nome: pino.nome,
                    id: pino._id,
                    capibas: pino.capibas || 0
                }
            },
            calculadoCom: "geolib",
            validatedAt: new Date().toISOString()
        };

        console.log('✅ Resposta da validação:', resposta);
        res.status(200).json(resposta);

    } catch (error) {
        console.error("❌ Erro crítico na validação:", error);
        res.status(500).json({ 
            valid: false, 
            message: "Erro interno no servidor durante validação.",
            detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * ENCONTRA TODOS OS PINOS PRÓXIMOS DA PESSOA
 * Usado para mostrar pinos disponíveis próximos
 */
const encontrarPinosProximos = async (req, res) => {
    try {
        const { 
            latitudeUsuario,    
            longitudeUsuario,   
            raioMaximo = 100,   // Raio em metros
            limite = 10         // Limite de resultados
        } = req.body;

        // Validações básicas
        const latUsuario = parseFloat(latitudeUsuario);
        const lngUsuario = parseFloat(longitudeUsuario);
        
        if (isNaN(latUsuario) || isNaN(lngUsuario)) {
            return res.status(400).json({ 
                success: false,
                message: "Coordenadas inválidas." 
            });
        }

        // Busca TODOS os pinos (poderia ser otimizado com consulta geoespacial)
        const todosPinos = await Pino.find({});
        
        const localizacaoUsuario = {
            latitude: latUsuario,
            longitude: lngUsuario
        };

        // Calcula distância para cada pino e filtra os próximos
        const pinosComDistancia = todosPinos.map(pino => {
            // ✅ CORRIGIDO: Ordem das coordenadas - GeoJSON usa [longitude, latitude]
            const localizacaoPino = {
                latitude: pino.localizacao.coordinates[1], // ✅ Latitude na posição 1
                longitude: pino.localizacao.coordinates[0]  // ✅ Longitude na posição 0
            };

            const distancia = geolib.getDistance(localizacaoUsuario, localizacaoPino);
            
            return {
                id: pino._id,
                nome: pino.nome,
                msg: pino.msg,
                capibas: pino.capibas || 0,
                localizacao: localizacaoPino,
                distancia: {
                    metros: distancia,
                    km: (distancia / 1000).toFixed(2)
                },
                estaProximo: distancia <= raioMaximo
            };
        });

        // Ordena por distância (mais próximo primeiro)
        const pinosOrdenados = pinosComDistancia.sort((a, b) => a.distancia.metros - b.distancia.metros);
        
        // Filtra apenas os que estão no raio e limita resultados
        const pinosProximos = pinosOrdenados
            .filter(pino => pino.estaProximo)
            .slice(0, limite);

        res.json({
            success: true,
            totalPinos: todosPinos.length,
            pinosProximos: pinosProximos,
            pinosEncontrados: pinosProximos.length,
            localizacaoUsuario: localizacaoUsuario,
            raioBusca: raioMaximo
        });

    } catch (error) {
        console.error("❌ Erro ao buscar pinos próximos:", error);
        res.status(500).json({ 
            success: false,
            message: "Erro ao buscar pinos próximos." 
        });
    }
}

/**
 * VALIDAÇÃO OTIMIZADA USANDO CONSULTA GEOESPACIAL DO MONGODB + GEOLIB
 * Combina a eficiência do MongoDB com a precisão do geolib
 */
const validarProximidadeOtimizada = async (req, res) => {
    try {
        const { 
            latitudeUsuario,    
            longitudeUsuario,   
            raioMaximo = 100    
        } = req.body;

        const latUsuario = parseFloat(latitudeUsuario);
        const lngUsuario = parseFloat(longitudeUsuario);
        
        if (isNaN(latUsuario) || isNaN(lngUsuario)) {
            return res.status(400).json({ 
                valid: false, 
                message: "Coordenadas devem ser números válidos." 
            });
        }

        // CONSULTA GEOESPACIAL DO MONGODB (RÁPIDA)
        const pinosProximos = await Pino.find({
            localizacao: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lngUsuario, latUsuario] // ✅ CORRETO: [lng, lat]
                    },
                    $maxDistance: raioMaximo
                }
            }
        });

        const localizacaoUsuario = { latitude: latUsuario, longitude: lngUsuario };

        // USA GEOLIB PARA CÁLCULOS PRECISOS
        const pinosComDistanciaPrecisa = pinosProximos.map(pino => {
            // ✅ CORRIGIDO: Ordem das coordenadas - GeoJSON usa [longitude, latitude]
            const localizacaoPino = {
                latitude: pino.localizacao.coordinates[1], // ✅ Latitude na posição 1
                longitude: pino.localizacao.coordinates[0]  // ✅ Longitude na posição 0
            };

            const distancia = geolib.getDistance(localizacaoUsuario, localizacaoPino);

            return {
                id: pino._id,
                nome: pino.nome,
                msg: pino.msg,
                capibas: pino.capibas || 0,
                distancia: {
                    metros: distancia,
                    km: (distancia / 1000).toFixed(3)
                },
                estaProximo: distancia <= raioMaximo
            };
        });

        const encontrouPinos = pinosComDistanciaPrecisa.length > 0;

        res.json({ 
            valid: encontrouPinos,
            message: encontrouPinos ? 
                `🎯 Encontrado(s) ${pinosComDistanciaPrecisa.length} pino(s) próximo(s)!` : 
                "📍 Nenhum pino encontrado próximo a você.",
            pinos: pinosComDistanciaPrecisa,
            totalEncontrados: pinosComDistanciaPrecisa.length,
            localizacaoUsuario: localizacaoUsuario,
            calculadoCom: "MongoDB + geolib"
        });

    } catch (error) {
        console.error("❌ Erro na validação otimizada:", error);
        res.status(500).json({ 
            valid: false, 
            message: "Erro interno no servidor." 
        });
    }
}

/**
 * FUNÇÃO AUXILIAR: Retorna interpretação humana da distância
 */
function getInterpretacaoDistancia(distanciaMetros) {
    if (distanciaMetros < 10) return "Muito próximo";
    if (distanciaMetros < 50) return "Próximo";
    if (distanciaMetros < 100) return "Perto";
    if (distanciaMetros < 500) return "Um pouco longe";
    if (distanciaMetros < 1000) return "Longe";
    return "Muito longe";
}

// EXPORTA AS FUNÇÕES
module.exports = {
    validarProximidadePino,
    encontrarPinosProximos,
    validarProximidadeOtimizada
};