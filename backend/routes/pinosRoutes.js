const express = require("express");
const router = express.Router();
const path = require("path"); // redenrizar arquivos HTML
const fs = require("fs"); // ler arquivos Html
const pinoController = require("../controllers/pinoController"); // importa o controler com a logica de nogocio

// ==================================================
// Rota que retorna todos os pinos
router.get("/", pinoController.getTodosPinos);

// ==================================================
// Rota pra renderizar HTML (fica igual, pois é lógica de front/arquivo)
router.get("/adicionar", (req, res) => {
  try {
    const htmlPath = path.join(__dirname, "../test/adicionarpinos.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf8");
    res.send(htmlContent);
  } catch (err) {
    console.error("❌ Erro ao carregar HTML:", err);
    res.status(500).send("Erro ao carregar página");
  }
});

// ==================================================
// Rota pra criar novo pino
router.post("/adicionar", pinoController.criarPino);

// ==================================================
// Rota pra renderizar HTML de deleção
router.get("/deletar", (req, res) => {
  try {
    const htmlPath = path.join(__dirname, "../test/deletarpinos.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf8");
    res.send(htmlContent);
  } catch (err) {
    console.error("❌ Erro ao carregar HTML:", err);
    res.status(500).send("Erro ao carregar página");
  }
});

// ==================================================
// Rota pra deletar um pino pelo ID
router.delete("/deletar/:id", pinoController.deletarPino);

// ==================================================
// Rota pra renderizar HTML de atualização (vai ser substituída)
router.get("/atualizar", (req, res) => {
  try {
    const htmlPath = path.join(__dirname, "../test/atualizarpinos.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf8");
    res.send(htmlContent);
  } catch (err) {
    console.error("❌ Erro ao carregar HTML:", err);
    res.status(500).send("Erro ao carregar página");
  }
});

// ==================================================
// Rota para atualizar
router.put("/atualizar/:id", pinoController.atualizarPino);

// ==================================================
module.exports = router;
