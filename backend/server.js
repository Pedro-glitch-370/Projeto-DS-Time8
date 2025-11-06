// Importa o framework Express para criar o servidor web
const express = require('express')
// Cria uma instância do aplicativo Express
const app = express();
// Importa o middleware CORS para permitir requisições de diferentes origens
const cors = require('cors')
// importa as rotas
const pinoRoutes = require('./routes/pinosRoutes')
// Importa a configuração do banco de dados
const { connectDB, disconnectDB, getDBStatus } = require('./config/db');

// Define a porta onde o servidor vai rodar
const PORT = process.env.PORT || 5001;

// MIDDLEWARES - Funções que processam as requisições antes das rotas
// Habilita CORS para permitir que o frontend (React) acesse este backend
app.use(cors())
app.use(express.json())

// ==================================================
// CONEXÃO COM O BANCO DE DADOS
const initializeDatabase = async () => {
    try {
        await connectDB();
        console.log('🗄️  Banco de dados inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Falha ao inicializar o banco de dados:', error);
        process.exit(1);
    }
};

// ==================================================
// ROTAS DA API
app.use('/api/pinos', pinoRoutes)

// Rota de teste - Para verificar se o servidor está funcionando
// GET http://localhost:5001/api/test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend está funcionando! 🎉' });
});

// ==================================================
// INICIALIZAÇÃO DO SERVIDOR
const startServer = async () => {
    try {
        await initializeDatabase();
        
        const server = app.listen(PORT, () => {
            console.log('='.repeat(50))
            console.log('🚀 SERVIDOR BACKEND INICIADO!')
            console.log(`📍 Porta: ${PORT}`)
            console.log(`📍 Banco de dados: ${getDBStatus().connected ? 'Conectado ✅' : 'Desconectado ❌'}`)
            console.log('='.repeat(50))
        });

        // 👇 AGORA SIM, no arquivo principal do servidor:
        // Graceful shutdown - tratamento correto para encerramento
        process.on('SIGINT', async () => {
            console.log('\n🔻 Recebido SIGINT - Encerrando servidor graciosamente...')
            await disconnectDB()
            server.close(() => {
                console.log('👋 Servidor encerrado!')
                process.exit(0)
            });
        });

        process.on('SIGTERM', async () => {
            console.log('\n🔻 Recebido SIGTERM - Encerrando servidor graciosamente...')
            await disconnectDB()
            server.close(() => {
                console.log('👋 Servidor encerrado!')
                process.exit(0);
            })
        })
        
    } catch (error) {
        console.error('❌ Falha ao iniciar o servidor:', error)
        process.exit(1)
    }
}

startServer()