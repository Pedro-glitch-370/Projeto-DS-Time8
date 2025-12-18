const express = require("express")
const router = express.Router()
const validar = require("../controllers/validarLocalizacaoController.js")

// Rota para validar proximidade com um pino específico
router.post("/proximidade-pino", validar.validarProximidadePino)

// Rota para encontrar todos os pinos próximos
router.post("/pinos-proximos", validar.encontrarPinosProximos)

// Rota para validação otimizada
router.post("/proximidade-otimizada", validar.validarProximidadeOtimizada)

module.exports = router