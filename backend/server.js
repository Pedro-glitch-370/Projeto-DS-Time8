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
app.use(cors());
// Configura o Express para interpretar JSON no corpo das requisições
app.use(express.json());

// BANCO DE DADOS SIMULADO - Array com os pinos fixos do mapa
// Em uma aplicação real, isso viria de um banco de dados
const pinos = [
  {
    id: 1,
    coord: [-8.063149, -34.871139], // Latitude e longitude do Marco Zero - Recife
    msg: "Praça do Marco Zero - ponto inicial da cidade",
    titulo: "Marco Zero"
  },
  {
    id: 2,
    coord: [-8.061692, -34.871157], // Coordenadas do Paço do Frevo
    msg: "Paço do Frevo - museu dedicado ao frevo",
    titulo: "Paço do Frevo"
  },
  {
    id: 3,
    coord: [-8.062258, -34.870942], // Coordenadas da Embaixada dos Bonecos
    msg: "Embaixada dos Bonecos Gigantes - artesanato local",
    titulo: "Bonecos Gigantes"
  },
  {
    id: 4,
    coord: [-8.064200, -34.872500], // Coordenadas da Caixa Cultural
    msg: "Caixa Cultural - centro cultural com exposições",
    titulo: "Caixa Cultural"
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