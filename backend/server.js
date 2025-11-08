// ================== Importações ==================
const express = require("express"); // Importa o framework Express para criar o servidor web
const app = express(); // Cria uma instância do aplicativo Express
const cors = require("cors"); // Importa o middleware CORS para permitir requisições de diferentes origens
const { connectDB, disconnectDB, getDBStatus } = require("./config/db"); // Importa a configuração do banco de dados

const pinoRoutes = require("./routes/pinosRoutes"); // Importa as rotas
/*quando criar novas rotas, adicionar aqui*/

// ==================================================
// Define a porta onde o servidor vai rodar
const PORT = process.env.PORT || 5001;

// ==================================================
// Conexão com o Banco de Dados
const initializeDatabase = async () => {
  try {
    await connectDB();
    console.log("🗄️ Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Falha ao inicializar o banco de dados:", error);
    process.exit(1);
  }
};

// ==================================================
// Middlewares - Funções que processam as requisições antes das rotas
app.use(cors()); // Habilita CORS para permitir que o frontend (React) acesse este backend
app.use(express.urlencoded({ extended: true })); // Middleware para interpretar dados JSON e dados de formulários URL-encoded
app.use(express.json());

// ==================================================
// Rotas da API
app.use("/api/pinos", pinoRoutes);

// ==================================================
// Inicialização do Servidor
const startServer = async () => {
  try {
    await initializeDatabase(); // inicializa o banco de dados, antes do server ficar online

    // inicia o servidor na porta previamente definida
    const server = app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log("🚀 SERVIDOR BACKEND INICIADO!");
      console.log(`📍 Porta: ${PORT}`); // numero da porta que o server tá rodando
      console.log(`📍 URL: http://localhost:${PORT}/api/test`); // rota pra testar se o backend tá funcionando
      console.log(`📍 URL: http://localhost:${PORT}/api/pinos`); // rota que pega todos os pinos do mongoDB
      console.log(`📍 URL: http://localhost:${PORT}/api/pinos/adicionar`); // rota para adicioar pinos
      console.log(`📍 URL: http://localhost:${PORT}/api/pinos/deletar`); // rota para deletar os pinos
      console.log(`📍 URL: http://localhost:${PORT}/api/pinos/atualizar`); // rota para atualizar os pinos
      console.log(
        `📍 Banco de dados: ${
          getDBStatus().connected ? "Conectado ✅" : "Desconectado ❌"
        }`
      ); // Indica se o banco de dados foi conectado
      console.log("=".repeat(50));
    });

    // Captura o sinal de encerramento do processo pra fechar a conexão com o banco
    process.on("SIGINT", async () => {
      console.log("\n🔻 Recebido SIGINT - Encerrando servidor...");
      await disconnectDB();
      server.close(() => {
        console.log("👋 Servidor encerrado!");
        process.exit(0);
      });
    });

    // Tratamento de erros na inicialização
  } catch (error) {
    console.error("❌ Falha ao iniciar o servidor:", error);
    process.exit(1);
  }
};

// ==================================================
// Função que inicia o servidor, boa pratica para deixar o codigo organizado e funcional
startServer();
