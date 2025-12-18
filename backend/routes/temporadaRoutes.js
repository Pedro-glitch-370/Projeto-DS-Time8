const express = require("express");
const router = express.Router();
const TemporadaController = require("../controllers/temporadaController");

// ================== ROTAS DE ADMIN ==================

// GET - Listar todas as temporadas
router.get("/", TemporadaController.listarTemporadas);

// POST - Criar nova temporada
router.post("/", TemporadaController.criarTemporada);

// DELETE - Excluir uma temporada
router.delete("/:id", TemporadaController.deletarTemporada);

// PATCH - Atualizar parcialmente
router.patch("/:id", TemporadaController.atualizarTemporada);

// ================== ROTAS PÚBLICAS/JOGADORES ==================

// GET - Pegar temporada atual
router.get("/atual", TemporadaController.temporadaAtual);

module.exports = router;
