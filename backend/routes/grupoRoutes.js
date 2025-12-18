const express = require('express');
const router = express.Router();
const GrupoController = require('../controllers/grupoController');

// ==================================================
// Rotas para grupos
// ==================================================

// POST - Criar grupo
router.post('/criar', GrupoController.criarGrupo);

// POST - Entrar em um grupo
router.post('/entrar', GrupoController.entrarGrupo);

// POST - Sair em um grupo
router.post('/sair', GrupoController.sairGrupo);

// GET - Pegar ranking
router.get('/ranking', GrupoController.rankingGrupos);

module.exports = router;