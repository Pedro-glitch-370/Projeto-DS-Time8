const Pino = require('../models/PinoModel'); // Importa o Model (Schema) do Pino para interagir com o MongoDB

// =================================================================
/**
 * Lógica para criar um novo pino no banco de dados.
 * Recebe nome, coordenadas e mensagem via corpo da requisição (req.body).
 * @param {Object} req - Objeto de requisição do Express, contendo os dados do formulário.
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {void} Envia um redirecionamento ou uma resposta de erro.
 */
const criarPino = async (req, res) => {
    try {
        // Extrai os campos do corpo da requisição
        const { nome, latitude, longitude, msg } = req.body

        // 1. Validação de dados de entrada
        const lng = parseFloat(longitude)
        const lat = parseFloat(latitude)

        // Verifica se as coordenadas são números válidos após a conversão
        if (isNaN(lng) || isNaN(lat)) {
            // Retorna um erro 400 (Bad Request) se a validação falhar
            return res.status(400).send('Erro: Latitude e Longitude devem ser números válidos.');
        }

        console.log('Dados recebidos no Controller:', { nome, latitude, longitude, msg })

        // 2. Interação com o Model (Cria uma nova instância do Pino)
        const novoPino = new Pino({
            nome: nome,
            // O Mongoose espera as coordenadas no formato GeoJSON [longitude, latitude]
            localizacao: {
                type: 'Point',
                coordinates: [lng, lat] 
            },
            msg: msg
        })

        // Salva o novo pino no banco de dados, retornando o objeto salvo
        const pinoSalvo = await novoPino.save()
        console.log("✅ Pino salvo no banco de dados:", pinoSalvo._id)

        // 3. Resposta para o Cliente
        // Redireciona o usuário de volta com um parâmetro de sucesso
        res.redirect('/api/pinos/adicionar?success=true');

    } catch (err) {
        // Manipulação de erros e resposta 500 (Internal Server Error)
        console.error('❌ Erro ao salvar pino no Controller:', err)
        res.status(500).send('Erro ao salvar pino: ' + err.message)
    }
};

// =================================================================
/**
 * Lógica para obter todos os pinos do banco de dados.
 * @param {Object} req - Objeto de requisição do Express (não utilizado aqui, mas mantido para assinatura).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {void} Envia um array JSON de pinos ou uma resposta de erro 500.
 */
const getTodosPinos = async (req, res) => {
    try {
        // Busca e retorna todos os documentos (pinos) da coleção
        const pinos = await Pino.find();
        console.log('📌 Controller solicitou todos os pinos!');
        // Envia a lista de pinos como resposta JSON
        res.json(pinos); 
    } catch (err) {
        // Manipulação de erros e resposta 500
        res.status(500).json({ error: 'Erro ao buscar pinos no Controller: ' + err.message });
    }
};

// =================================================================
/**
 * Lógica para deletar um pino específico pelo seu ID (MongoDB _id).
 * O ID é esperado como um parâmetro de rota (ex: DELETE /api/pinos/deletar/12345).
 * @param {Object} req - Objeto de requisição (espera o ID em req.params.id).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {void} Envia uma mensagem de sucesso ou uma resposta de erro (404 ou 500).
 */
const deletarPino = async (req, res) => {
    try {
        const pinoId = req.params.id; // Captura o ID do pino a ser deletado

        // Usa findByIdAndDelete para deletar o documento e retornar o documento deletado
        const resultado = await Pino.findByIdAndDelete(pinoId);
        
        // Verifica se o resultado é nulo, indicando que o ID não foi encontrado
        if (!resultado) {
            return res.status(404).json({ error: 'Pino não encontrado.' });
        }
        
        // Retorna uma resposta de sucesso
        console.log(`🗑️ Pino deletado: ${pinoId}`);
        res.json({ message: 'Pino deletado com sucesso.', deletedId: pinoId })
    } catch (err) {
        // Captura erros (ex: formato de ID inválido) e retorna 500
        res.status(500).json({ error: 'Erro ao deletar pino no Controller: ' + err.message });
    }
}

// =================================================================
/**
 * Lógica para atualizar um pino específico pelo seu ID.
 * Recebe o ID via parâmetro de rota e os novos dados via corpo da requisição.
 * @param {Object} req - Objeto de requisição (espera o ID em req.params.id e os dados em req.body).
 * @param {Object} res - Objeto de resposta do Express.
 * @returns {void} Envia o pino atualizado (JSON) ou uma resposta de erro (404 ou 500).
 */
const atualizarPino = async (req, res) => {
    try {
        const pinoId = req.params.id;
        const { nome, latitude, longitude, msg } = req.body;

        // Validação de coordenadas
        const lng = parseFloat(longitude);
        const lat = parseFloat(latitude);

        if (isNaN(lng) || isNaN(lat)) {
            return res.status(400).send('Erro: Latitude e Longitude devem ser números válidos.');
        }

        // Tenta encontrar e atualizar o pino
        const pinoAtualizado = await Pino.findByIdAndUpdate(
            pinoId,
            { // Objeto com os campos a serem atualizados
                nome: nome,
                localizacao: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                msg: msg
            },
            { new: true } // { new: true } retorna o documento atualizado, não o antigo
        );

        // Verifica se o pino foi encontrado e atualizado
        if (!pinoAtualizado) {
            return res.status(404).json({ error: 'Pino não encontrado.' });
        }

        // Retorna o pino atualizado em JSON
        console.log(`🔄 Pino atualizado: ${pinoId}`);
        res.json(pinoAtualizado);
    } catch (err) {
        // Captura erros de banco de dados ou formato de ID
        res.status(500).json({ error: 'Erro ao atualizar pino no Controller: ' + err.message });
    }
}

// =================================================================
// Exporta as funções de controller para que possam ser usadas no arquivo de rotas
module.exports = {
    criarPino,
    getTodosPinos,
    deletarPino,
    atualizarPino
};