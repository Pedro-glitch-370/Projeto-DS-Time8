// ================== Importações ==================
const express = require("express") // Importa o framework Express para criar o servidor web
const app = express() // Cria uma instância do aplicativo Express
const cors = require("cors") // Importa o middleware CORS para permitir requisições de diferentes origens
const { connectDB, disconnectDB, getDBStatus } = require("./config/db") // Importa a configuração do banco de dados

// Importa as rotas
const pinoRoutes = require("./routes/pinosRoutes") 
const clienteRoutes = require("./routes/clienteRoutes.js")
const adminRoutes = require("./routes/adminRoutes.js")
/*quando criar novas rotas, adicionar aqui*/

// ==================================================
// Define a porta onde o servidor vai rodar
const PORT = process.env.PORT || 5001

// ==================================================
// Conexão com o Banco de Dados
const initializeDatabase = async () => {
  try {
    await connectDB()
    console.log("🗄️ Banco de dados inicializado com sucesso!")
  } catch (error) {
    console.error("❌ Falha ao inicializar o banco de dados:", error)
    process.exit(1)
  }
};

// ==================================================
// Middlewares - Funções que processam as requisições antes das rotas
app.use(cors()) // Habilita CORS para permitir que o frontend (React) acesse este backend
app.use(express.urlencoded({ extended: true })) // Middleware para interpretar dados JSON e dados de formulários URL-encoded
app.use(express.json()) // Middleware para interpretar dados JSON no corpo das requisições

// ==================================================
// Rotas da API
app.use("/api/pinos", pinoRoutes)
app.use("/api/auth/clientes", clienteRoutes)
app.use("/api/auth/admins", adminRoutes)
/*quando criar novas rotas, adicionar aqui*/

// ==================================================
// Inicialização do Servidor
const startServer = async () => {
  try {
    await initializeDatabase() // inicializa o banco de dados, antes do server ficar online

    // inicia o servidor na porta previamente definida
    const server = app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log("SERVIDOR BACKEND INICIADO!")
      console.log(`Porta: ${PORT}`) // numero da porta que o server tá rodando
      console.log(`URL: http://localhost:${PORT}/api/pinos`) // rota que pega todos os pinos do mongoDB
      
      // Novas URLs para clientes
      console.log(`URL: http://localhost:${PORT}/api/auth/clientes/`) // listar clientes
      console.log(`URL: http://localhost:${PORT}/api/auth/clientes/register`) // registrar cliente
      console.log(`URL: http://localhost:${PORT}/api/auth/clientes/login`) // login cliente
      console.log(`URL: http://localhost:${PORT}/api/auth/clientes/email/:email`) // buscar cliente por email
      
      // Novas URLs para admins
      console.log(`URL: http://localhost:${PORT}/api/auth/admins/`) // listar admins
      console.log(`URL: http://localhost:${PORT}/api/auth/admins/register`) // registrar admin
      console.log(`URL: http://localhost:${PORT}/api/auth/admins/login`) // login admin
      console.log(`URL: http://localhost:${PORT}/api/auth/admins/email/:email`) // buscar admin por email
      
      console.log(
        `Banco de dados: ${
          getDBStatus().connected ? "Conectado" : "Desconectado"
        }`
      ); // Indica se o banco de dados foi conectado
      console.log("=".repeat(50))
    })

    // Captura o sinal de encerramento do processo pra fechar a conexão com o banco
    process.on("SIGINT", async () => {
      console.log("\nRecebido SIGINT - Encerrando servidor...")
      await disconnectDB()
      server.close(() => {
        console.log("Servidor encerrado!")
        process.exit(0)
      })
    })

    // Tratamento de erros na inicialização
  } catch (error) {
    console.error("Falha ao iniciar o servidor:", error)
    process.exit(1)
  }
}

// ==================================================
// Função que inicia o servidor, boa pratica para deixar o codigo organizado e funcional
startServer()