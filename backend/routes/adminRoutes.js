const express = require("express")
const router = express.Router()
const AdminController = require("../controllers/adminController")

// ================== ROTAS DE AUTENTICAÇÃO ==================

// POST - Registrar admin
router.post("/register", AdminController.registrarAdmin)

// POST - Login admin
router.post("/login", AdminController.loginAdmin)

// ================== ROTAS DE GERENCIAMENTO ==================

// GET - Listar todos os admins
router.get("/", AdminController.listarAdmins)

// GET - Buscar admin por email
router.get("/email/:email", AdminController.buscarAdminPorEmail)

// GET - Buscar admin por ID
router.get("/:id", AdminController.buscarAdminPorId)

// POST - Concluir tarefa
router.post("/:id/tarefas/concluir", AdminController.concluirTarefa)

// DELETE - Deletar admin
router.delete("/:id", AdminController.deletarAdmin)

module.exports = router