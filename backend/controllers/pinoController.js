const Pino = require("../models/pinoModel") // Importa o Model (Schema) do Pino para interagir com o MongoDB

// ==================================================
/**
 * Lógica para criar um novo pino no banco de dados
 * Recebe nome, coordenadas e mensagem via corpo da requisição (req.body)
 * @param {Object} req - Objeto de requisição do Express, contendo os dados do formulário
 * @param {Object} res - Objeto de resposta do Express
 * @returns {void} Envia um redirecionamento ou uma resposta de erro
 */

const criarPino = async (req, res) => {
  try {
    console.log('🔍 BACKEND - Dados recebidos no criarPino:');
    console.log('📦 req.body completo:', req.body);
    console.log('📍 Tem localizacao?', !!req.body.localizacao);
    console.log('📍 localizacao:', req.body.localizacao);
    console.log('📍 Tem coordinates?', !!req.body.localizacao?.coordinates);
    console.log('📍 coordinates:', req.body.localizacao?.coordinates);
    console.log('🪙 Capibas recebidos:', req.body.capibas)
    console.log('📍 Tipo de coordinates:', typeof req.body.localizacao?.coordinates);
    console.log('📍 É array?', Array.isArray(req.body.localizacao?.coordinates));

    // CORREÇÃO: Aceitar tanto o formato com localizacao quanto formato direto
    let coordinates;

    if (req.body.localizacao && req.body.localizacao.coordinates) {
      // Formato: { localizacao: { coordinates: [lng, lat] } }
      coordinates = req.body.localizacao.coordinates;
      console.log('📍 Usando formato localizacao.coordinates');
    } else if (req.body.coordinates) {
      // Formato alternativo: { coordinates: [lng, lat] }
      coordinates = req.body.coordinates;
      console.log('📍 Usando formato direto coordinates');
    } else {
      console.log('❌ Nenhum formato de coordenadas encontrado');
      return res.status(400).json({
        message: "Formato de localização inválido. Use { localizacao: { coordinates: [lng, lat] } } ou { coordinates: [lng, lat] }"
      });
    }

    console.log('📍 Coordenadas extraídas:', coordinates);

    // Validação dos dados de entrada
    if (!req.body.nome || !req.body.msg) {
      return res.status(400).json({
        message: "Nome e mensagem são obrigatórios"
      });
    }

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        message: "Coordenadas devem ser um array com 2 elementos [longitude, latitude]"
      });
    }

    const [longitude, latitude] = coordinates;

    // Verifica se as coordenadas são números válidos
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({
        message: "Longitude e Latitude devem ser números válidos."
      });
    }

    console.log("📍 Coordenadas processadas:", { longitude: lng, latitude: lat });
    console.log("🪙 Capibas processados:", req.body.capibas);

    // Cria o pino com o formato correto do Schema
    const novoPino = new Pino({
      nome: req.body.nome,
      msg: req.body.msg,
      capibas: Number(req.body.capibas) || 0,
      localizacao: {
        type: "Point",
        coordinates: [lng, lat] // [longitude, latitude] - FORMATO CORRETO
      }
    });

    const pinoSalvo = await novoPino.save();
    console.log("✅ Pino salvo no banco de dados:", pinoSalvo._id);

    res.status(201).json({
      message: "Pino criado com sucesso",
      pino: pinoSalvo
    });

  } catch (err) {
    console.error("❌ Erro ao salvar pino no Controller:", err);
    res.status(500).json({
      message: "Erro ao salvar pino: " + err.message
    });
  }
}

// ==================================================
/**
 * Lógica para obter todos os pinos do banco de dados
 * @param {Object} req - Objeto de requisição do Express (não utilizado aqui, mas mantido para assinatura)
 * @param {Object} res - Objeto de resposta do Express
 * @returns {void} Envia um array JSON de pinos ou uma resposta de erro 500
 */

const getTodosPinos = async (req, res) => {
  try {
    // Busca e retorna todos os documentos (pinos) da coleção
    const pinos = await Pino.find()
    console.log("📌 Controller solicitou todos os pinos!")
    // Envia a lista de pinos como resposta JSON
    res.json(pinos);
  } catch (err) {
    // Manipulação de erros e resposta 500
    res
      .status(500)
      .json({ error: "Erro ao buscar pinos no Controller: " + err.message })
  }
}

// ==================================================
/**
 * Lógica para deletar um pino específico pelo seu ID (MongoDB _id)
 * O ID é esperado como um parâmetro de rota (ex: DELETE /api/pinos/deletar/12345)
 * @param {Object} req - Objeto de requisição (espera o ID em req.params.id)
 * @param {Object} res - Objeto de resposta do Express
 * @returns {void} Envia uma mensagem de sucesso ou uma resposta de erro (404 ou 500)
 */

const deletarPino = async (req, res) => {
  try {
    const pinoId = req.params.id // Captura o ID do pino a ser deletado

    // Usa findByIdAndDelete para deletar o documento e retornar o documento deletado
    const resultado = await Pino.findByIdAndDelete(pinoId)

    // Verifica se o resultado é nulo, indicando que o ID não foi encontrado
    if (!resultado) {
      return res.status(404).json({ error: "Pino não encontrado." })
    }

    // Retorna uma resposta de sucesso
    console.log(`🗑️ Pino deletado: ${pinoId}`)
    res.json({ message: "Pino deletado com sucesso.", deletedId: pinoId })
  } catch (err) {
    // Captura erros (ex: formato de ID inválido) e retorna 500
    res
      .status(500)
      .json({ error: "Erro ao deletar pino no Controller: " + err.message })
  }
}

// ==================================================
/**
 * Lógica para atualizar um pino específico pelo seu ID
 * Recebe o ID via parâmetro de rota e os novos dados via corpo da requisição
 * @param {Object} req - Objeto de requisição (espera o ID em req.params.id e os dados em req.body)
 * @param {Object} res - Objeto de resposta do Express
 * @returns {void} Envia o pino atualizado (JSON) ou uma resposta de erro (404 ou 500)
 */

const atualizarPino = async (req, res) => {
  try {
    const { id } = req.params;
     const { nome, msg, localizacao, capibas } = req.body;

    console.log("✏️ Recebendo atualização para pino ID:", id);
    console.log("📝 Dados recebidos:", { nome, msg, localizacao });
    console.log("🪙 Capibas para atualizar:", capibas);

    // Validações básicas
    if (!nome || !msg || !localizacao) {
      return res.status(400).json({ 
        message: "Nome, mensagem e localização são obrigatórios" 
      });
    }

    if (!localizacao.coordinates || !Array.isArray(localizacao.coordinates)) {
      return res.status(400).json({ 
        message: "Formato de coordenadas inválido" 
      });
    }

    const [longitude, latitude] = localizacao.coordinates;
    
    // Verifica se são números válidos
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    if (isNaN(lng) || isNaN(lat)) {
      console.log("❌ Coordenadas inválidas - lng:", lng, "lat:", lat);
      return res.status(400).json({ 
        message: "Longitude e Latitude devem ser números válidos." 
      });
    }

    console.log("✅ Coordenadas válidas:", { longitude: lng, latitude: lat });
    console.log("✅ Capibas válidos:", capibas);

    // Verificar se o pino existe
    const pinoExistente = await Pino.findById(id);
    if (!pinoExistente) {
      return res.status(404).json({ message: "Pino não encontrado" });
    }

    // Atualizar o pino - FORMATO CORRETO
    const pinoAtualizado = await Pino.findByIdAndUpdate(
      id,
      {
        nome,
        msg,
        capibas: Number(capibas) || 0,
        localizacao: {
          type: "Point",
          coordinates: [lng, lat] // [longitude, latitude] - FORMATO CORRETO
        }
      },
      { new: true, runValidators: true }
    );

    console.log("✅ Pino atualizado com sucesso:", pinoAtualizado._id);
    console.log("🪙 Novos capibas:", pinoAtualizado.capibas);

    res.json(pinoAtualizado);

  } catch (error) {
    console.error("❌ Erro ao atualizar pino:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Dados inválidos",
        errors: error.errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "ID do pino inválido" 
      });
    }
    
    res.status(500).json({ 
      message: "Erro interno do servidor ao atualizar pino" 
    });
  }
}

// ==================================================
// Exporta as funções de controller para que possam ser usadas no arquivo de rotas
module.exports = {
  criarPino,
  getTodosPinos,
  deletarPino,
  atualizarPino,
}
