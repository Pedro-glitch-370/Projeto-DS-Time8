const express = require("express");
const router = express.Router();
const ClienteController = require("../controllers/clienteController");

// ================== ROTAS DE AUTENTICAÇÃO ==================

// POST - Registrar cliente
router.post("/register", ClienteController.registrarCliente);

// POST - Login cliente
router.post("/login", ClienteController.loginCliente);

// ================== ROTAS DE GERENCIAMENTO ==================

// GET - Listar todos os clientes
router.get("/", ClienteController.listarClientes);

// GET - Buscar cliente por email
router.get("/email/:email", ClienteController.buscarClientePorEmail);

// GET - Buscar cliente por ID
router.get("/:id", ClienteController.buscarClientePorId);

// POST - Concluir tarefa
router.post("/:id/tarefas/concluir", ClienteController.concluirTarefa);

// DELETE - Deletar cliente
router.delete("/:id", ClienteController.deletarCliente);

module.exports = router;