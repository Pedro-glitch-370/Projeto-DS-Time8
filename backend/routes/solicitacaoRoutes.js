const express = require("express");
const router = express.Router();
const SolicitacaoController = require("../controllers/solicitacaoController");

// GET - Todas as solicitações
router.get("/", SolicitacaoController.getTodasSolicitacoes);

// GET - Nome do solicitante para uma solicitação específica (nova rota)
router.get("/solicitante/:id", SolicitacaoController.getNomeSolicitante);

// POST - Criar nova solicitação
router.post("/adicionar", SolicitacaoController.criarSolicitacao);

// PUT - Atualizar solicitação
router.put("/atualizar/:id", SolicitacaoController.atualizarSolicitacao);

// DELETE - Deletar solicitação
router.delete("/deletar/:id", SolicitacaoController.deletarSolicitacao);

// PATCH - Aprovar solicitação
router.patch("/aprovar/:id", SolicitacaoController.aprovarSolicitacao);

// PATCH - Rejeitar solicitação
router.patch("/rejeitar/:id", SolicitacaoController.rejeitarSolicitacao);

module.exports = router;