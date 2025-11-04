// Importa o framework Express para criar o servidor web
import express from 'express';
// Importa o middleware CORS para permitir requisições de diferentes origens
import cors from 'cors';

// Cria uma instância do aplicativo Express
const app = express();
// Define a porta onde o servidor vai rodar
const PORT = 5000;

// MIDDLEWARES - Funções que processam as requisições antes das rotas
// Habilita CORS para permitir que o frontend (React) acesse este backend
// por meio da permissão de um aplicativo web em uma origem acessar recursos em outra origem diferente
app.use(cors());
// Configura o Express para interpretar JSON no corpo das requisições
app.use(express.json());

// BANCO DE DADOS SIMULADO - Array com os pinos fixos do mapa
// Em uma aplicação real, isso viria de um banco de dados
const pinos = [
  {
    id: 1,
    coord: [-8.061921, -34.901674], // Latitude e longitude - Recife
    msg: "Criar área simples de lazer",
    titulo: "Área de Lazer"
  },
  {
    id: 2,
    coord: [-8.072237, -34.925757], // Coordenadas
    msg: "Realizar Mural em Escola Municipal",
    titulo: "Escola Municipal"
  },
  {
    id: 3,
    coord: [-8.057035, -34.900528], // Coordenadas
    msg: "Pintar e Renovar Campo na Praça do Derby",
    titulo: "Campo na Praça do Derby"
  },
  {
    id: 4,
    coord: [-8.069600, -34.888016], // Coordenadas
    msg: "Pintar e Renovar Quadra Campo dos Coelhos",
    titulo: "Quadra Campo dos Coelhos"
  },
];

// ROTAS DA API

// Rota principal - Retorna todos os pinos do mapa
// GET http://localhost:5000/api/pinos
app.get('/api/pinos', (req, res) => {
  // Log para debug - mostra quando alguém acessa a rota
  console.log('📌 Alguém solicitou os pinos!');
  // Retorna o array de pinos como JSON
  res.json(pinos);
});

// Rota de teste - Para verificar se o servidor está funcionando
// GET http://localhost:5000/api/test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend está funcionando! 🎉' });
});

// INICIALIZAÇÃO DO SERVIDOR
// Inicia o servidor na porta especificada
app.listen(PORT, () => {
  // Mensagem visualmente destacada no console
  console.log('='.repeat(50));
  console.log('🚀 SERVIDOR BACKEND INICIADO!');
  console.log(`📍 Porta: ${PORT}`);
  console.log(`📍 URL dos pinos: http://localhost:${PORT}/api/pinos`);
  console.log(`📍 URL de teste: http://localhost:${PORT}/api/test`);
  console.log('='.repeat(50));
});