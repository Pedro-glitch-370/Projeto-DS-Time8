const express = require('express');
const router = express.Router();
const GrupoController = require('../controllers/grupoController');

router.post('/criar', GrupoController.criarGrupo);
router.post('/entrar', GrupoController.entrarGrupo);
router.post('/sair', GrupoController.sairGrupo);
router.get('/ranking', GrupoController.rankingGrupos);

module.exports = router;