// Importa a biblioteca Mongoose para interagir com o MongoDB
const mongoose = require("mongoose");

// ==================================================
/**
 * Tenta estabelecer a conexão com o banco de dados MongoD
 * A URI de conexão é obtida da variável de ambiente MONGODB_URI ou usa um fallback local
 * * @async
 * @returns {Promise<mongoose.Connection>} A instância de conexão bem-sucedida do Mongoose
 */

const connectDB = async () => {
  try {
    // Pega a URI de conexão, utilizando uma variável de ambiente ou um valor padrão
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb+srv://acsj2_db_user:aaaa@cluster0.02dncab.mongodb.net/"
    //"mongodb+srv://pedroh7brito_db_user:Ew1L1igsu2ixWkVs@naxron.hba9ufc.mongodb.net/"
    //"mongodb://localhost:27017/RPG"

    // Conecta ao MongoDB usando Mongoose
    const connection = await mongoose.connect(MONGODB_URI)

    // Logs de sucesso e detalhes da conexão
    console.log("Conectado ao MongoDB:", connection.connection.name)
    console.log("Host:", connection.connection.host)
    console.log("Porta:", connection.connection.port)

    return connection;
  } catch (error) {
    // Logs de erro e encerramento do processo em caso de falha crítica na conexão inicial
    console.error("Erro ao conectar com MongoDB:", error.message)
    process.exit(1)
  }
}

// ==================================================
/**
 * Fecha a conexão ativa com o MongoDB
 * * @async
 */

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("Conexão com MongoDB fechada");
  } catch (error) {
    console.error("Erro ao fechar conexão:", error.message);
  }
}

// ==================================================
/**
 * Retorna o status atual da conexão com o banco de dados
 * * @returns {Object} Objeto contendo o status detalhado da conexão
 */

const getDBStatus = () => {
  return {
    // 'connected' é true se o readyState for 1 (CONNECTED)
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  }
}

// ==================================================
// Listeners de eventos do Mongoose para monitoramento contínuo da conexão

// Evento disparado quando a conexão é estabelecida
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose conectado ao MongoDB")
});

// Evento disparado quando ocorre um erro depois da conexão inicial
mongoose.connection.on("error", (err) => {
  console.error("🔴 Erro na conexão do Mongoose:", err)
});

// Evento disparado quando a conexão é perdida
mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose desconectado do MongoDB")
});

// ==================================================
// Exporta as funções e a instância do Mongoose para uso em outros módulos
module.exports = {
  connectDB,
  disconnectDB,
  getDBStatus,
  mongoose,
}