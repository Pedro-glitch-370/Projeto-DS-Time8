const express = require("express")
const router = express.Router()
const pinoController = require("../controllers/pinoController")

// ==================================================
// Rotas para pinos
// ==================================================

// GET - Todos os pinos
router.get("/", pinoController.getTodosPinos)

// POST - Criar novo pino
router.post("/adicionar", pinoController.criarPino)

// PUT - Atualizar pino
router.put("/atualizar/:id", pinoController.atualizarPino)

// DELETE - Deletar pino
router.delete("/deletar/:id", pinoController.deletarPino)

module.exports = router