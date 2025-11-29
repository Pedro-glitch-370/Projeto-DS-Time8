const geolib = require('geolib'); // Biblioteca para cálculos geográficos

/**
 * VALIDA SE UMA PESSOA ESTÁ PRÓXIMA DE UM PINO ESPECÍFICO
 * Usado quando já se sabe qual pino verificar (ex: usuário clicou em um pino no mapa)
 */
const validarProximidadePino = async (req, res) => {
    try {
        // Extrai dados do corpo da requisição
        const { 
            latitudePessoa,     // Latitude da localização da pessoa
            longitudePessoa,    // Longitude da localização da pessoa
            pinoId,             // ID do pino específico a ser verificado
            raioMaximo = 100    // Raio máximo em metros (padrão: 100m)
        } = req.body;

        // VALIDAÇÃO 1: Verifica se todos os campos obrigatórios foram enviados
        if (latitudePessoa === undefined || longitudePessoa === undefined || !pinoId) {
            return res.status(400).json({ 
                valid: false, 
                message: "Coordenadas da pessoa e ID do pino são obrigatórios." 
            });
        }

        // VALIDAÇÃO 2: Converte as coordenadas para números e verifica se são válidas
        const latPessoa = parseFloat(latitudePessoa);
        const lngPessoa = parseFloat(longitudePessoa);
        
        if (isNaN(latPessoa) || isNaN(lngPessoa)) {
            return res.status(400).json({ 
                valid: false, 
                message: "Coordenadas devem ser números válidos." 
            });
        }

        // VALIDAÇÃO 3: Verifica se as coordenadas estão dentro dos intervalos globais válidos
        const isValidLatitude = latPessoa >= -90 && latPessoa <= 90;
        const isValidLongitude = lngPessoa >= -180 && lngPessoa <= 180;

        if (!isValidLatitude || !isValidLongitude) {
            return res.status(400).json({ 
                valid: false, 
                message: "Coordenadas fora dos intervalos válidos." 
            });
        }

        // BUSCA NO BANCO: Procura o pino específico no MongoDB usando o ID
        const Pino = require('/api/Pinos'); // Importa o modelo de Pino
        const pino = await Pino.findById(pinoId);

        // Verifica se o pino foi encontrado
        if (!pino) {
            return res.status(404).json({ 
                valid: false, 
                message: "Pino não encontrado." 
            });
        }

        // PREPARA DADOS PARA CÁLCULO: Cria objetos de localização para a biblioteca geolib
        const localizacaoPessoa = {
            latitude: latPessoa,
            longitude: lngPessoa
        };

        const localizacaoPino = {
            latitude: pino.localizacao.coordinates[1], // Latitude está na posição 1 do array
            longitude: pino.localizacao.coordinates[0] // Longitude está na posição 0 do array
        };

        // CÁLCULO DA DISTÂNCIA: Usa geolib para calcular distância em metros
        const distancia = geolib.getDistance(localizacaoPessoa, localizacaoPino);
        
        // VERIFICA PROXIMIDADE: Compara com o raio máximo permitido
        const estaProximo = distancia <= raioMaximo;

        // RESPOSTA DA API: Retorna todos os detalhes da validação
        res.status(200).json({ 
            valid: estaProximo, // true se está próximo, false se não está
            message: estaProximo ? 
                "Pessoa está dentro do raio permitido do pino." : 
                "Pessoa está fora do raio permitido do pino.",
            distancia: {
                metros: distancia,                    // Distância em metros
                km: (distancia / 1000).toFixed(3)    // Distância em quilômetros
            },
            limites: {
                raioMaximoMetros: raioMaximo,         // Raio máximo em metros
                raioMaximoKm: (raioMaximo / 1000).toFixed(3) // Raio máximo em km
            },
            localizacoes: {
                pessoa: {
                    latitude: latPessoa,
                    longitude: lngPessoa
                },
                pino: {
                    latitude: localizacaoPino.latitude,
                    longitude: localizacaoPino.longitude,
                    nome: pino.nome,    // Nome do pino
                    id: pino._id        // ID do pino
                }
            },
            validatedAt: new Date().toISOString() // Timestamp da validação
        });

    } catch (error) {
        // TRATAMENTO DE ERRO: Captura qualquer erro inesperado
        console.error("Erro na validação de proximidade:", error);
        res.status(500).json({ 
            valid: false, 
            message: "Erro interno no servidor durante validação." 
        });
    }
}

/**
 * ENCONTRA O PINO MAIS PRÓXIMO DA PESSOA ENTRE TODOS OS PINOS
 * Usado quando não se sabe qual pino verificar (ex: encontrar pino mais próximo automaticamente)
 */
const validarProximidadeMultiplosPinos = async (req, res) => {
    try {
        // Extrai dados do corpo da requisição
        const { 
            latitudePessoa,     // Latitude da pessoa
            longitudePessoa,    // Longitude da pessoa
            raioMaximo = 100    // Raio máximo em metros (padrão: 100m)
        } = req.body;

        // VALIDAÇÃO: Converte e verifica as coordenadas (igual à função anterior)
        const latPessoa = parseFloat(latitudePessoa);
        const lngPessoa = parseFloat(longitudePessoa);
        
        if (isNaN(latPessoa) || isNaN(lngPessoa)) {
            return res.status(400).json({ 
                valid: false, 
                message: "Coordenadas devem ser números válidos." 
            });
        }

        // BUSCA TODOS OS PINOS: Obtém todos os pinos do banco de dados
        const Pino = require('/api/Pinos');
        const pinos = await Pino.find({});

        // Prepara localização da pessoa para cálculos
        const localizacaoPessoa = {
            latitude: latPessoa,
            longitude: lngPessoa
        };

        // ENCONTRA O PINO MAIS PRÓXIMO: Percorre todos os pinos calculando distâncias
        let pinoMaisProximo = null;     // Armazena o pino mais próximo encontrado
        let menorDistancia = Infinity;  // Inicia com valor infinito para comparação

        for (const pino of pinos) {
            // Prepara localização do pino atual
            const localizacaoPino = {
                latitude: pino.localizacao.coordinates[1],
                longitude: pino.localizacao.coordinates[0]
            };

            // Calcula distância entre pessoa e pino atual
            const distancia = geolib.getDistance(localizacaoPessoa, localizacaoPino);
            
            // Atualiza se encontrou um pino mais próximo
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                pinoMaisProximo = {
                    pino: pino,
                    distancia: distancia
                };
            }
        }

        // VERIFICA SE ESTÁ DENTRO DO RAIO PERMITIDO
        const estaProximo = menorDistancia <= raioMaximo;

        // RESPOSTA DA API
        res.status(200).json({ 
            valid: estaProximo,
            message: estaProximo ? 
                "Pessoa está próxima de um pino." : 
                "Pessoa não está próxima de nenhum pino.",
            pinoMaisProximo: pinoMaisProximo ? {
                id: pinoMaisProximo.pino._id,           // ID do pino mais próximo
                nome: pinoMaisProximo.pino.nome,        // Nome do pino mais próximo
                distancia: {
                    metros: pinoMaisProximo.distancia,  // Distância em metros
                    km: (pinoMaisProximo.distancia / 1000).toFixed(3) // Distância em km
                }
            } : null, // null se não encontrou nenhum pino
            // Lista com distância para todos os pinos (útil para debug)
            todosPinos: pinos.map(pino => ({
                id: pino._id,
                nome: pino.nome,
                distancia: geolib.getDistance(localizacaoPessoa, {
                    latitude: pino.localizacao.coordinates[1],
                    longitude: pino.localizacao.coordinates[0]
                })
            })),
            validatedAt: new Date().toISOString()
        });

    } catch (error) {
        // TRATAMENTO DE ERRO
        console.error("Erro na validação de múltiplos pinos:", error);
        res.status(500).json({ 
            valid: false, 
            message: "Erro interno no servidor." 
        });
    }
}

/**
 * VALIDAÇÃO OTIMIZADA USANDO CONSULTA GEOESPACIAL DO MONGODB
 * MUITO MAIS RÁPIDO - usa índices do MongoDB para buscar pinos próximos
 * RECOMENDADO PARA USO EM PRODUÇÃO
 */
const validarProximidadeOtimizada = async (req, res) => {
    try {
        // Extrai dados do corpo da requisição
        const { 
            latitudePessoa,     // Latitude da pessoa
            longitudePessoa,    // Longitude da pessoa
            raioMaximo = 100    // Raio máximo em metros (padrão: 100m)
        } = req.body;

        // VALIDAÇÃO: Converte e verifica as coordenadas
        const latPessoa = parseFloat(latitudePessoa);
        const lngPessoa = parseFloat(longitudePessoa);
        
        if (isNaN(latPessoa) || isNaN(lngPessoa)) {
            return res.status(400).json({ 
                valid: false, 
                message: "Coordenadas devem ser números válidos." 
            });
        }

        // Importa modelo do Pino
        const Pino = require('./models/Pino');

        // CONSULTA GEOESPACIAL DO MONGODB - MUITO EFICIENTE
        // Usa operador $near para buscar pinos dentro do raio especificado
        const pinosProximos = await Pino.find({
            localizacao: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lngPessoa, latPessoa] // [longitude, latitude] - formato MongoDB
                    },
                    $maxDistance: raioMaximo // Raio máximo em metros
                }
            }
        });

        // Verifica se encontrou algum pino
        const encontrouPinos = pinosProximos.length > 0;

        // RESPOSTA DA API
        res.status(200).json({ 
            valid: encontrouPinos,
            message: encontrouPinos ? 
                `Encontrado(s) ${pinosProximos.length} pino(s) próximo(s).` : 
                "Nenhum pino encontrado no raio especificado.",
            // Lista detalhada de todos os pinos encontrados
            pinosProximos: pinosProximos.map(pino => ({
                id: pino._id,           // ID do pino
                nome: pino.nome,        // Nome do pino
                msg: pino.msg,          // Mensagem do pino
                capibas: pino.capibas,  // Pontos/recursos do pino
                localizacao: {
                    latitude: pino.localizacao.coordinates[1], // Latitude
                    longitude: pino.localizacao.coordinates[0]  // Longitude
                }
            })),
            totalPinos: pinosProximos.length, // Quantidade total de pinos encontrados
            limites: {
                raioMaximoMetros: raioMaximo // Raio máximo usado na busca
            },
            validatedAt: new Date().toISOString()
        });

    } catch (error) {
        // TRATAMENTO DE ERRO
        console.error("Erro na validação otimizada:", error);
        res.status(500).json({ 
            valid: false, 
            message: "Erro interno no servidor." 
        });
    }
}

// EXPORTA TODAS AS FUNÇÕES PARA USO NAS ROTAS
module.exports = {
    validarProximidadePino,           // Para validar pino específico
    validarProximidadeMultiplosPinos, // Para encontrar pino mais próximo
    validarProximidadeOtimizada       // Para busca otimizada (RECOMENDADO)
};