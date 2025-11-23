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

// DELETE - Deletar admin
router.delete("/:id", AdminController.deletarAdmin)

// Rota para admin concluir tarefa
router.post('/:id/tarefas/concluir', async (req, res) => {
  try {
    const { tarefaId, capibas } = req.body;
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ message: "Admin não encontrado" });
    }

    if (!admin.tarefasConcluidas) {
      admin.tarefasConcluidas = [];
    }
    
    if (!admin.tarefasConcluidas.includes(tarefaId)) {
      admin.tarefasConcluidas.push(tarefaId);
      admin.tarefasCompletas = (admin.tarefasCompletas || 0) + 1;
      admin.capibas = (admin.capibas || 0) + capibas;
      
      await admin.save();
      
      console.log(`✅ Tarefa ${tarefaId} concluída por admin ${admin.nome}. Total: ${admin.tarefasCompletas} tarefas`);
    }

    res.json({ 
      message: "Tarefa concluída com sucesso", 
      capibas: admin.capibas,
      tarefasCompletas: admin.tarefasCompletas,
      tarefasConcluidas: admin.tarefasConcluidas 
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao concluir tarefa", error: error.message });
  }
});

module.exports = router