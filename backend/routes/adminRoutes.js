const express = require("express")
const router = express.Router()
const path = require("path")
const fs = require("fs")
const pinoController = require("../controllers/pinoController")
const adminController = require("../controllers/adminController")

// ==================================================
// ROTAS DOS ADMINS
// ==================================================

// Criar admin
router.post("/criar-admin", adminController.criarAdmin)

// Listar todos admins
router.get("/admins", adminController.listarAdmins)

// Deletar admin
router.delete("/deletar-admin/:id", adminController.deletarAdmin)

// ==================================================
// ROTAS DOS PINOS
// ==================================================

// Página de cadastrar pino
router.get("/cadastrar-pino", (req, res) => {
  try {
    const htmlPath = path.join(__dirname, "../test/adicionarpinos.html")
    const htmlContent = fs.readFileSync(htmlPath, "utf8")
    res.send(htmlContent)
  } catch (err) {
    console.error("❌ Erro ao carregar cadastro:", err)
    res.status(500).send("Erro ao carregar página")
  }
})

// Processar cadastro de pino
router.post("/cadastrar-pino", pinoController.criarPino)

// API - Buscar todos os pinos
router.get("/pinos", pinoController.getTodosPinos)

// Página de editar pino
router.get("/editar-pino/:id", (req, res) => {
  try {
    const htmlPath = path.join(__dirname, "../test/atualizarpinos.html")
    const htmlContent = fs.readFileSync(htmlPath, "utf8")
    res.send(htmlContent)
  } catch (err) {
    console.error("❌ Erro ao carregar edição:", err)
    res.status(500).send("Erro ao carregar página")
  }
})

// Processar edição de pino
router.put("/editar-pino/:id", pinoController.atualizarPino)

// Processar deleção de pino
router.delete("/deletar-pino/:id", pinoController.deletarPino)

// ==================================================
module.exports = router