const express = require("express")
const router = express.Router()
const PinoController = require("../controllers/pinoController")

// ==================================================
// Rotas para pinos
// ==================================================

// GET - Todos os pinos
router.get("/", PinoController.getTodosPinos)

// POST - Criar novo pino
router.post("/adicionar", PinoController.criarPino)

// PUT - Atualizar pino
router.put("/atualizar/:id", PinoController.atualizarPino)

// DELETE - Deletar pino
router.delete("/deletar/:id", PinoController.deletarPino)

// GET - Pegar pinos da temporada ativa
router.get("/available", async (req, res) => {
  await PinoController.getPinosDisponiveis(req, res);
});

// GET - Buscar conclusões de um pino
router.get("/:id/conclusoes", PinoController.buscarConclusoesPino);

module.exports = router