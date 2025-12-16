const express = require("express");
const router = express.Router();
const TemporadaController = require("../controllers/temporadaController");

// ================== ROTAS DE ADMIN ==================

// POST - Criar nova temporada
router.post("/", TemporadaController.criarTemporada);

// GET - Listar todas as temporadas
router.get("/", TemporadaController.listarTemporadas);

// DELETE - Excluir uma temporada
router.delete("/:id", TemporadaController.deletarTemporada);

// ================== ROTAS PÚBLICAS/JOGADORES ==================

// GET - Pegar temporada atual
router.get("/atual", TemporadaController.temporadaAtual);

module.exports = router;
