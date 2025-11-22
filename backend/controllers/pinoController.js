const Pino = require("../models/pinoModel");

// ==================================================
// Funções auxiliares
// ==================================================

/**
 * Loga informações de debug para operações com pinos
 */
const logOperacao = (operacao, dados) => {
  console.log(`🔍 ${operacao}:`, dados);
};

/**
 * Loga sucesso de operações
 */
const logSucesso = (operacao, resultado) => {
  console.log(`✅ ${operacao} com sucesso:`, resultado);
};

/**
 * Loga erros de forma padronizada
 */
const logErro = (operacao, erro) => {
  console.error(`❌ Erro ao ${operacao}:`, erro);
};

/**
 * Extrai coordenadas do request body em diferentes formatos
 */
const extrairCoordenadas = (body) => {
  if (body.localizacao?.coordinates) {
    return {
      coordinates: body.localizacao.coordinates,
      formato: 'localizacao.coordinates'
    };
  }
  
  if (body.coordinates) {
    return {
      coordinates: body.coordinates,
      formato: 'coordinates'
    };
  }
  
  return null;
};

/**
 * Valida dados básicos do pino
 */
const validarDadosPino = (nome, msg, coordinates) => {
  const erros = [];

  if (!nome) erros.push("Nome é obrigatório");
  if (!msg) erros.push("Mensagem é obrigatória");
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    erros.push("Coordenadas devem ser um array com 2 elementos [longitude, latitude]");
  }

  return erros;
};

/**
 * Valida e parseia coordenadas
 */
const validarCoordenadas = (coordinates) => {
  const [longitude, latitude] = coordinates;
  const lng = parseFloat(longitude);
  const lat = parseFloat(latitude);

  if (isNaN(lng) || isNaN(lat)) {
    throw new Error("Longitude e Latitude devem ser números válidos");
  }

  return { lng, lat };
};

/**
 * Formata dados do pino para salvar no banco
 */
const formatarPinoParaBanco = (dados, lng, lat) => ({
  nome: dados.nome,
  msg: dados.msg,
  capibas: Number(dados.capibas) || 0,
  localizacao: {
    type: "Point",
    coordinates: [lng, lat]
  }
});

// ==================================================
// Controladores principais
// ==================================================

/**
 * Cria um novo pino no banco de dados
 */
const criarPino = async (req, res) => {
  try {
    logOperacao('BACKEND - Dados recebidos no criarPino', {
      body: req.body,
      capibas: req.body.capibas,
      localizacao: req.body.localizacao
    });

    // Extrair e validar coordenadas
    const coordenadasExtraidas = extrairCoordenadas(req.body);
    if (!coordenadasExtraidas) {
      return res.status(400).json({
        message: "Formato de localização inválido. Use { localizacao: { coordinates: [lng, lat] } } ou { coordinates: [lng, lat] }"
      });
    }

    console.log(`📍 Usando formato: ${coordenadasExtraidas.formato}`);

    // Validações básicas
    const errosValidacao = validarDadosPino(
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
    const { lng, lat } = validarCoordenadas(coordenadasExtraidas.coordinates);
    
    console.log("📍 Coordenadas processadas:", { longitude: lng, latitude: lat });
    console.log("🪙 Capibas processados:", req.body.capibas);

    // Criar e salvar pino
    const dadosPino = formatarPinoParaBanco(req.body, lng, lat);
    const novoPino = new Pino(dadosPino);
    const pinoSalvo = await novoPino.save();

    logSucesso('salvar pino no banco', {
      id: pinoSalvo._id,
      nome: pinoSalvo.nome,
      capibas: pinoSalvo.capibas
    });

    res.status(201).json({
      message: "Pino criado com sucesso",
      pino: pinoSalvo
    });

  } catch (err) {
    logErro('salvar pino no Controller', err);
    
    res.status(500).json({
      message: "Erro ao salvar pino: " + err.message
    });
  }
};

/**
 * Obtém todos os pinos do banco de dados
 */
const getTodosPinos = async (req, res) => {
  try {
    const pinos = await Pino.find().sort({ createdAt: -1 });
    
    logSucesso('buscar pinos', `${pinos.length} pinos encontrados`);
    
    res.json(pinos);
  } catch (err) {
    logErro('buscar pinos no Controller', err);
    
    res.status(500).json({ 
      error: "Erro ao buscar pinos: " + err.message 
    });
  }
};

/**
 * Deleta um pino específico pelo ID
 */
const deletarPino = async (req, res) => {
  try {
    const pinoId = req.params.id;

    const resultado = await Pino.findByIdAndDelete(pinoId);

    if (!resultado) {
      return res.status(404).json({ 
        error: "Pino não encontrado." 
      });
    }

    logSucesso('deletar pino', pinoId);

    res.json({ 
      message: "Pino deletado com sucesso.", 
      deletedId: pinoId 
    });

  } catch (err) {
    logErro('deletar pino no Controller', err);
    
    res.status(500).json({ 
      error: "Erro ao deletar pino: " + err.message 
    });
  }
};

/**
 * Atualiza um pino específico pelo ID
 */
const atualizarPino = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, msg, localizacao, capibas } = req.body;

    logOperacao('atualizar pino', {
      id,
      nome,
      msg,
      capibas,
      localizacao
    });

    // Validações básicas
    const errosValidacao = validarDadosPino(nome, msg, localizacao?.coordinates);
    if (errosValidacao.length > 0) {
      return res.status(400).json({ 
        message: "Dados inválidos",
        errors: errosValidacao
      });
    }

    // Validar e parsear coordenadas
    const { lng, lat } = validarCoordenadas(localizacao.coordinates);
    
    console.log("✅ Coordenadas válidas:", { longitude: lng, latitude: lat });
    console.log("✅ Capibas válidos:", capibas);

    // Verificar se o pino existe
    const pinoExistente = await Pino.findById(id);
    if (!pinoExistente) {
      return res.status(404).json({ 
        message: "Pino não encontrado" 
      });
    }

    // Atualizar pino
    const dadosAtualizacao = formatarPinoParaBanco({ nome, msg, capibas }, lng, lat);
    const pinoAtualizado = await Pino.findByIdAndUpdate(
      id,
      dadosAtualizacao,
      { new: true, runValidators: true }
    );

    logSucesso('atualizar pino', {
      id: pinoAtualizado._id,
      nome: pinoAtualizado.nome,
      capibas: pinoAtualizado.capibas
    });

    res.json(pinoAtualizado);

  } catch (error) {
    logErro('atualizar pino', error);
    
    // Tratamento específico de erros do Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Dados inválidos",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID do pino inválido" 
      });
    }

    // Erro de validação de coordenadas
    if (error.message.includes("Longitude e Latitude")) {
      return res.status(400).json({ 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Erro interno do servidor ao atualizar pino" 
    });
  }
};

// ==================================================
// Exporta as funções de controller
// ==================================================

module.exports = {
  criarPino,
  getTodosPinos,
  deletarPino,
  atualizarPino,
};