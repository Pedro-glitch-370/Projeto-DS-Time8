const express = require("express")
const router = express.Router()
const path = require("path")
const fs = require("fs")
const pinoController = require("../controllers/pinoController")


// ==================================================
// ROTAS DOS CLIENTES - APENAS VER E ADICIONAR PINOS
// ==================================================


// Página do mapa - cliente vê os pinos
router.get("/mapa", (req, res) => {
  try {
    const htmlPath = path.join(__dirname, "../test/adicionarpinos.html")
    const htmlContent = fs.readFileSync(htmlPath, "utf8")
    res.send(htmlContent)
  } catch (err) {
    console.error("❌ Erro ao carregar mapa:", err)
    res.status(500).send("Erro ao carregar mapa")
  }
})


// Página de adicionar pino
router.get("/adicionar-pino", (req, res) => {
  try {
    const htmlPath = path.join(__dirname, "../test/adicionarpinos.html")
    const htmlContent = fs.readFileSync(htmlPath, "utf8")
    res.send(htmlContent)
  } catch (err) {
    console.error("❌ Erro ao carregar cadastro:", err)
    res.status(500).send("Erro ao carregar página de cadastro")
  }
})


// Processar cadastro de pino
router.post("/adicionar-pino", pinoController.criarPino)


// API - Buscar todos os pinos (para o mapa)
router.get("/pinos", pinoController.getTodosPinos)


// ==================================================
module.exports = router




