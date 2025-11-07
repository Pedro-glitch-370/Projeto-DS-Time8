const express = require('express')
const router = express.Router()
const path = require('path') // redenrizar arquivos HTML
const fs = require('fs') // ler arquivos Html
const pinoController = require('../controllers/pinoController') // importa o controler com a logica de nogocio

// ================================================================
// ROTA QUE RETORNA TODOS OS PINOS
router.get('/', pinoController.getTodosPinos);

// ================================================================
// ROTA PARA RENDERIZAR HTML (Permanece igual, pois é lógica de front/arquivo)
router.get('/adicionar', (req, res) => {
    try {
        const htmlPath = path.join(__dirname, '../test/adicionarpinos.html')
        const htmlContent = fs.readFileSync(htmlPath, 'utf8')
        res.send(htmlContent)
    } catch (err) {
        console.error('❌ Erro ao carregar HTML:', err)
        res.status(500).send('Erro ao carregar página')
    }
})

// ================================================================
// ROTA PARA CRIAR NOVO PINO
router.post('/adicionar', pinoController.criarPino)

// ================================================================
// ROTA PARA RENDERIZAR HTML DE DELEÇÃO
router.get('/deletar' , (req, res) => {
    try {
        const htmlPath = path.join(__dirname, '../test/deletarpinos.html')
        const htmlContent = fs.readFileSync(htmlPath, 'utf8')
        res.send(htmlContent)
    } catch (err) {
        console.error('❌ Erro ao carregar HTML:', err)
        res.status(500).send('Erro ao carregar página')
    }
})

// ================================================================
// ROTA PARA DELETAR UM PINO PELO ID
router.delete('/deletar/:id', pinoController.deletarPino)

// ================================================================
// ROTA PARA RENDERIZAR HTML DE ATUALIZAÇÃO. vai ser substituida
router.get('/atualizar', (req, res) => {
    try {
        const htmlPath = path.join(__dirname, '../test/atualizarpinos.html')
        const htmlContent = fs.readFileSync(htmlPath, 'utf8')
        res.send(htmlContent)
    } catch (err) {
        console.error('❌ Erro ao carregar HTML:', err)
        res.status(500).send('Erro ao carregar página')
    }
})

// ================================================================
// Rota para atualizar
router.put('/atualizar/:id', pinoController.atualizarPino)

// ================================================================

module.exports = router