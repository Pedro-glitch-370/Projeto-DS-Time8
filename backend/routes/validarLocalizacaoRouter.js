const express = require("express")
const router = express.Router()
const validar = require("../controllers/validarLocalizacaoController.js")

// Rota para validar proximidade com um pino específico
router.post("/proximidade-pino", validar.validarProximidadePino)

// Rota para validar proximidade com múltiplos pinos
router.post("/proximidade-multiplos", validar.validarProximidadeMultiplosPinos)

// Rota para validação otimizada (RECOMENDADA)
router.post("/proximidade-otimizada", validar.validarProximidadeOtimizada)

module.exports = router
