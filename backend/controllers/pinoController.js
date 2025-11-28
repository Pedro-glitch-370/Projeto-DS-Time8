const Pino = require("../models/pinoModel");
const mongoose = require("mongoose");

// ==================================================
// Classe PinoController - Controladora de operações com pinos
// ==================================================

class PinoController {
  // ==================================================
  // Métodos estáticos auxiliares (privados)
  // ==================================================

  /**
   * Loga informações de debug para operações com pinos
   */
  static _logOperacao(operacao, dados) {
    console.log(`🔍 ${operacao}:`, dados);
  }

  /**
   * Loga sucesso de operações
   */
  static _logSucesso(operacao, resultado) {
    console.log(`✅ ${operacao} com sucesso:`, resultado);
  }

  /**
   * Loga erros de forma padronizada
   */
  static _logErro(operacao, erro) {
    console.error(`❌ Erro ao ${operacao}:`, erro);
  }

  /**
   * Extrai coordenadas do request body em diferentes formatos
   */
  static _extrairCoordenadas(body) {
    // Verifica formato GeoJSON padrão
    if (body.localizacao?.coordinates && Array.isArray(body.localizacao.coordinates)) {
      return {
        coordinates: body.localizacao.coordinates,
        formato: 'localizacao.coordinates'
      };
    }
    
    // Verifica formato simplificado
    if (body.coordinates && Array.isArray(body.coordinates)) {
      return {
        coordinates: body.coordinates,
        formato: 'coordinates'
      };
    }
    
    // Verifica formato latitude/longitude separados
    if (body.latitude !== undefined && body.longitude !== undefined) {
      return {
        coordinates: [parseFloat(body.longitude), parseFloat(body.latitude)],
        formato: 'latitude/longitude'
      };
    }
    
    return null;
  }

  /**
   * Valida dados básicos do pino
   */
  static _validarDadosPino(nome, msg, coordinates) {
    const erros = [];

    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
      erros.push("Nome é obrigatório e deve ser uma string não vazia");
    }

    if (!msg || typeof msg !== 'string' || msg.trim().length === 0) {
      erros.push("Mensagem é obrigatória e deve ser uma string não vazia");
    }

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      erros.push("Coordenadas devem ser um array com 2 elementos [longitude, latitude]");
    } else {
      const [lng, lat] = coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number' || 
          isNaN(lng) || isNaN(lat) ||
          lng < -180 || lng > 180 || 
          lat < -90 || lat > 90) {
        erros.push("Coordenadas inválidas. Longitude deve estar entre -180 e 180, Latitude entre -90 e 90");
      }
    }

    return erros;
  }

  /**
   * Valida e parseia coordenadas
   */
  static _validarCoordenadas(coordinates) {
    const [longitude, latitude] = coordinates.map(coord => parseFloat(coord));

    if (isNaN(longitude) || isNaN(latitude)) {
      throw new Error("Longitude e Latitude devem ser números válidos");
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error("Longitude deve estar entre -180 e 180 graus");
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error("Latitude deve estar entre -90 e 90 graus");
    }

    return { lng: longitude, lat: latitude };
  }

  /**
   * Formata dados do pino para salvar no banco
   */
  static _formatarPinoParaBanco(dados, lng, lat) {
    return {
      nome: dados.nome?.trim(),
      msg: dados.msg?.trim(),
      capibas: Math.max(0, Number(dados.capibas) || 0), // Garante número positivo
      localizacao: {
        type: "Point",
        coordinates: [lng, lat]
      }
    };
  }

  // ==================================================
  // Controladores principais (métodos públicos)
  // ==================================================

  /**
   * Cria um novo pino no banco de dados
   */
  static async criarPino(req, res) {
    try {
      PinoController._logOperacao('BACKEND - Dados recebidos no criarPino', {
        body: req.body
      });

      // Extrair e validar coordenadas
      const coordenadasExtraidas = PinoController._extrairCoordenadas(req.body);
      if (!coordenadasExtraidas) {
        return res.status(400).json({
          message: "Formato de localização inválido. Use: { localizacao: { coordinates: [lng, lat] } }, { coordinates: [lng, lat] } ou { latitude: X, longitude: Y }"
        });
      }

      console.log(`📍 Usando formato: ${coordenadasExtraidas.formato}`);

      // Validações básicas
      const errosValidacao = PinoController._validarDadosPino(
        req.body.nome, 
        req.body.msg, 
        coordenadasExtraidas.coordinates
      );

      if (errosValidacao.length > 0) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: errosValidacao
        });
      }

      // Validar e parsear coordenadas
      const { lng, lat } = PinoController._validarCoordenadas(coordenadasExtraidas.coordinates);
      
      console.log("📍 Coordenadas processadas:", { longitude: lng, latitude: lat });

      // Criar e salvar pino
      const dadosPino = PinoController._formatarPinoParaBanco(req.body, lng, lat);
      const novoPino = new Pino(dadosPino);
      const pinoSalvo = await novoPino.save();

      PinoController._logSucesso('salvar pino no banco', {
        id: pinoSalvo._id,
        nome: pinoSalvo.nome,
        capibas: pinoSalvo.capibas
      });

      res.status(201).json({
        message: "Pino criado com sucesso",
        pino: pinoSalvo
      });

    } catch (err) {
      PinoController._logErro('salvar pino no Controller', err);
      
      // Erro de duplicação (se houver índices únicos)
      if (err.code === 11000) {
        return res.status(400).json({
          message: "Já existe um pino com estes dados"
        });
      }
      
      res.status(500).json({
        message: "Erro interno do servidor ao salvar pino"
      });
    }
  }

  /**
   * Obtém todos os pinos do banco de dados
   */
  static async getTodosPinos(req, res) {
    try {
      const pinos = await Pino.find().sort({ createdAt: -1 });
      
      PinoController._logSucesso('buscar pinos', `${pinos.length} pinos encontrados`);
      
      res.json(pinos);
    } catch (err) {
      PinoController._logErro('buscar pinos no Controller', err);
      
      res.status(500).json({ 
        message: "Erro interno do servidor ao buscar pinos"
      });
    }
  }

  /**
   * Deleta um pino específico pelo ID
   */
  static async deletarPino(req, res) {
    try {
      const pinoId = req.params.id;

      // Validar ID
      if (!mongoose.Types.ObjectId.isValid(pinoId)) {
        return res.status(400).json({ 
          message: "ID do pino inválido" 
        });
      }

      const resultado = await Pino.findByIdAndDelete(pinoId);

      if (!resultado) {
        return res.status(404).json({ 
          message: "Pino não encontrado" 
        });
      }

      PinoController._logSucesso('deletar pino', pinoId);

      res.json({ 
        message: "Pino deletado com sucesso",
        deletedId: pinoId 
      });

    } catch (err) {
      PinoController._logErro('deletar pino no Controller', err);
      
      res.status(500).json({ 
        message: "Erro interno do servidor ao deletar pino"
      });
    }
  }

  /**
   * Atualiza um pino específico pelo ID
   */
  static async atualizarPino(req, res) {
    try {
      const { id } = req.params;

      // Validar ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
          message: "ID do pino inválido" 
        });
      }

      PinoController._logOperacao('atualizar pino', {
        id,
        body: req.body
      });

      // Verificar se o pino existe
      const pinoExistente = await Pino.findById(id);
      if (!pinoExistente) {
        return res.status(404).json({ 
          message: "Pino não encontrado" 
        });
      }

      // Preparar dados para atualização
      const dadosAtualizacao = { ...req.body };
      
      // Processar coordenadas se fornecidas
      if (req.body.localizacao || req.body.coordinates || 
          (req.body.latitude !== undefined && req.body.longitude !== undefined)) {
        
        const coordenadasExtraidas = PinoController._extrairCoordenadas(req.body);
        if (!coordenadasExtraidas) {
          return res.status(400).json({
            message: "Formato de localização inválido para atualização"
          });
        }

        const { lng, lat } = PinoController._validarCoordenadas(coordenadasExtraidas.coordinates);
        dadosAtualizacao.localizacao = {
          type: "Point",
          coordinates: [lng, lat]
        };
      }

      // Validar dados básicos (usando coordenadas existentes se não for fornecida atualização)
      const coordenadasParaValidar = dadosAtualizacao.localizacao?.coordinates || pinoExistente.localizacao.coordinates;
      const errosValidacao = PinoController._validarDadosPino(
        dadosAtualizacao.nome || pinoExistente.nome,
        dadosAtualizacao.msg || pinoExistente.msg,
        coordenadasParaValidar
      );

      if (errosValidacao.length > 0) {
        return res.status(400).json({ 
          message: "Dados inválidos",
          errors: errosValidacao
        });
      }

      // Processar capibas
      if (dadosAtualizacao.capibas !== undefined) {
        dadosAtualizacao.capibas = Math.max(0, Number(dadosAtualizacao.capibas) || 0);
      }

      // Remover campos desnecessários
      delete dadosAtualizacao.coordinates;
      delete dadosAtualizacao.latitude;
      delete dadosAtualizacao.longitude;

      // Atualizar pino
      const pinoAtualizado = await Pino.findByIdAndUpdate(
        id,
        dadosAtualizacao,
        { new: true, runValidators: true }
      );

      PinoController._logSucesso('atualizar pino', {
        id: pinoAtualizado._id,
        nome: pinoAtualizado.nome,
        capibas: pinoAtualizado.capibas
      });

      res.json({
        message: "Pino atualizado com sucesso",
        pino: pinoAtualizado
      });

    } catch (error) {
      PinoController._logErro('atualizar pino', error);
      
      // Tratamento específico de erros do Mongoose
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: "Dados inválidos",
          errors: Object.values(error.errors).map(err => err.message)
        });
      }
      
      res.status(500).json({ 
        message: "Erro interno do servidor ao atualizar pino" 
      });
    }
  }

  /**
   * Busca um pino específico pelo ID
   */
  static async buscarPinoPorId(req, res) {
    try {
      const { id } = req.params;

      // Validar ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
          message: "ID do pino inválido" 
        });
      }

      PinoController._logOperacao('buscar pino por ID', { id });

      const pino = await Pino.findById(id);
      
      if (!pino) {
        return res.status(404).json({ 
          message: "Pino não encontrado" 
        });
      }

      PinoController._logSucesso('buscar pino por ID', {
        id: pino._id,
        nome: pino.nome
      });

      res.json(pino);

    } catch (error) {
      PinoController._logErro('buscar pino por ID', error);
      
      res.status(500).json({ 
        message: "Erro interno do servidor ao buscar pino" 
      });
    }
  }

  /**
   * Busca pinos por proximidade geográfica
   */
  static async buscarPinosPorProximidade(req, res) {
    try {
      const { longitude, latitude, raio = 1000 } = req.query; // raio em metros

      PinoController._logOperacao('buscar pinos por proximidade', {
        longitude,
        latitude,
        raio
      });

      // Validar coordenadas
      if (!longitude || !latitude) {
        return res.status(400).json({ 
          message: "Longitude e latitude são obrigatórias" 
        });
      }

      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      const radius = parseFloat(raio);

      if (isNaN(lng) || isNaN(lat) || isNaN(radius)) {
        return res.status(400).json({ 
          message: "Longitude, latitude e raio devem ser números válidos" 
        });
      }

      // Validar limites das coordenadas
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return res.status(400).json({ 
          message: "Coordenadas fora dos limites válidos" 
        });
      }

      const pinos = await Pino.find({
        localizacao: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat]
            },
            $maxDistance: radius
          }
        }
      });

      PinoController._logSucesso('buscar pinos por proximidade', {
        encontrados: pinos.length,
        centro: [lng, lat],
        raio: radius
      });

      res.json(pinos);

    } catch (error) {
      PinoController._logErro('buscar pinos por proximidade', error);
      res.status(500).json({ 
        message: "Erro interno do servidor ao buscar pinos por proximidade" 
      });
    }
  }
}

// ==================================================
// Exporta a classe PinoController
// ==================================================

module.exports = PinoController;