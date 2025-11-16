const express = require("express")
const router = express.Router()
const path = require("path")
const fs = require("fs")
const pinoController = require("../controllers/pinoController")

// ==================================================
// deletar o pino, mostrar a tela de deletar
router.get("/deletar-pino", (req, res) => {
  try {
    const htmlPath = path.join(__dirname, "../test/deletarpinos.html")
    const htmlContent = fs.readFileSync(htmlPath, "utf8")
    res.send(htmlContent)
  } catch (err) {
    console.error("❌ Erro ao carregar Dashboard Admin:", err)
    res.status(500).send("Erro ao carregar página do admin")
  }
})
// ============================== DELETAR PINO
router.delete("/deletar-pino/:id", pinoController.deletarPino)

// ==================================================
// 📍 CADASTRAR PINOS - Formulário
router.get("/cadastrar-pino", (req, res) => {
  try {
    const htmlPath = path.join(__dirname, "../test/adicionarpinos.html")
    const htmlContent = fs.readFileSync(htmlPath, "utf8")
    res.send(htmlContent)
  } catch (err) {
    console.error("❌ Erro ao carregar HTML de cadastro:", err)
    res.status(500).send("Erro ao carregar página de cadastro")
  }
})

// ==================================================
// 📍 CADASTRAR PINOS - Processar formulário
router.post("/cadastrar-pino", pinoController.criarPino)

// ==================================================
// VER MAPA
router.get("/mapa", (req, res) => {
  try {
    const htmlPath = path.join(__dirname, "../test/adicionarpinos.html")
    const htmlContent = fs.readFileSync(htmlPath, "utf8")
    res.send(htmlContent)
  } catch (err) {
    console.error("❌ Erro ao carregar Mapa Admin:", err)
    res.status(500).send("Erro ao carregar mapa")
  }
})

// ==================================================
// 🔍 API - Buscar todos os pinos
router.get("/pinos", pinoController.getTodosPinos)

// ==================================================
// ✏️ EDITAR PINO - Formulário
router.get("/editar-pino/:id", (req, res) => {
  try {
    const htmlPath = path.join(__dirname, "../test/atualizarpinos.html")
    const htmlContent = fs.readFileSync(htmlPath, "utf8")
    res.send(htmlContent)
  } catch (err) {
    console.error("❌ Erro ao carregar Editar Pino:", err)
    res.status(500).send("Erro ao carregar página de edição")
  }
})

// ==================================================
// ✏️ EDITAR PINO - Processar atualização
router.put("/editar-pino/:id", pinoController.atualizarPino)

// ==================================================
module.exports = router