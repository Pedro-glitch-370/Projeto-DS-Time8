const express = require("express");
const router = express.Router();
const TemporadaController = require("../controllers/temporadaController");
const { isAuthenticated, isAdmin } = require("../auth");

// ================== ROTAS DE ADMIN ==================

// POST - Criar nova temporada
router.post("/", isAuthenticated, isAdmin, TemporadaController.criarTemporada);

// GET - Listar todas as temporadas
router.get("/", isAuthenticated, isAdmin, TemporadaController.listarTemporadas);

// DELETE - Excluir uma temporada
router.delete("/:id", isAuthenticated, isAdmin, TemporadaController.deletarTemporada);

// ================== ROTAS PÚBLICAS/JOGADORES ==================

// GET - Pegar temporada atual
router.get("/atual", TemporadaController.temporadaAtual);

module.exports = router;
