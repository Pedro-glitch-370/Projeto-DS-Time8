const Pino = require("../models/PinoModel") // Importa o Model (Schema) do Pino para interagir com o MongoDB

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
    // Extrai os campos do corpo da requisição
    const { nome, latitude, longitude, msg } = req.body

    // Validação dos dados de entrada
    const lng = parseFloat(longitude)
    const lat = parseFloat(latitude)

    // Verifica se as coordenadas são números válidos após a conversão
    if (isNaN(lng) || isNaN(lat)) {
      // Retorna um erro 400 (Bad Request) se a validação falhar
      return res
        .status(400)
        .send("Erro: Latitude e Longitude devem ser números válidos.")
    }

    console.log("Dados recebidos no Controller:", {
      nome,
      latitude,
      longitude,
      msg,
    })

    // Interação com o Model (cria uma nova instância do pino)
    const novoPino = new Pino({
      nome: nome,
      // O Mongoose espera as coordenadas no formato GeoJSON [longitude, latitude]
      localizacao: {
        type: "Point",
        coordinates: [lng, lat],
      },
      msg: msg,
    })

    // Salva o novo pino no banco de dados, retornando o objeto salvo
    const pinoSalvo = await novoPino.save()
    console.log("✅ Pino salvo no banco de dados:", pinoSalvo._id)

    // Resposta pro cliente
    // Redireciona o usuário de volta com um parâmetro de sucesso
    res.redirect("/api/pinos/adicionar?success=true")
  } catch (err) {
    // Manipulação de erros e resposta 500 (Internal Server Error)
    console.error("❌ Erro ao salvar pino no Controller:", err)
    res.status(500).send("Erro ao salvar pino: " + err.message)
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
    const { nome, msg, localizacao } = req.body;

    console.log("✏️ Recebendo atualização para pino ID:", id);
    console.log("📝 Dados recebidos no backend:", { nome, msg, localizacao });
    
    // DEBUG DETALHADO
    console.log("📍 Coordenadas recebidas:", localizacao?.coordinates);
    console.log("📍 São números válidos?", 
      !isNaN(localizacao?.coordinates?.[0]), 
      !isNaN(localizacao?.coordinates?.[1])
    );
    console.log("📍 Valores exatos:", 
      localizacao?.coordinates?.[0], 
      localizacao?.coordinates?.[1]
    );

    // Validações básicas
    if (!nome || !msg || !localizacao) {
      return res.status(400).json({ 
        message: "Nome, mensagem e localização são obrigatórios" 
      });
    }

    // Verifica se as coordenadas existem e são válidas
    if (!localizacao.coordinates || !Array.isArray(localizacao.coordinates)) {
      console.log("❌ Coordenadas não são um array:", localizacao.coordinates);
      return res.status(400).json({ 
        message: "Formato de coordenadas inválido" 
      });
    }

    const [lng, lat] = localizacao.coordinates;
    
    // Verifica se são números válidos
    if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
      console.log("❌ Coordenadas inválidas - lng:", lng, "lat:", lat);
      console.log("❌ Tipos - lng:", typeof lng, "lat:", typeof lat);
      return res.status(400).json({ 
        message: "Latitude e Longitude devem ser números válidos." 
      });
    }

    console.log("✅ Coordenadas válidas:", lng, lat);

    // Verificar se o pino existe
    const pinoExistente = await Pino.findById(id);
    if (!pinoExistente) {
      return res.status(404).json({ message: "Pino não encontrado" });
    }

    // Atualizar o pino
    const pinoAtualizado = await Pino.findByIdAndUpdate(
      id,
      {
        nome,
        msg,
        localizacao: {
          type: "Point",
          coordinates: [lng, lat]
        }
      },
      { new: true, runValidators: true }
    );

    console.log("✅ Pino atualizado com sucesso:", pinoAtualizado._id);
    
    res.json(pinoAtualizado);

  } catch (error) {
    console.error("❌ Erro ao atualizar pino:", error);
    
    if (error.name === 'ValidationError') {
      console.error("❌ Erro de validação do Mongoose:", error.errors);
      return res.status(400).json({ 
        message: "Dados inválidos",
        errors: error.errors 
      });
    }
    
    if (error.name === 'CastError') {
      console.error("❌ Erro de cast (ID inválido):", error);
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
