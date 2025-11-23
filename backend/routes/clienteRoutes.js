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

// DELETE - Deletar cliente
router.delete("/:id", ClienteController.deletarCliente);

// Rota para concluir uma tarefa
router.post('/:id/tarefas/concluir', async (req, res) => {
  try {
    const { tarefaId, capibas } = req.body;
    const cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    // Verificar se a tarefa já foi concluída
    if (!cliente.tarefasConcluidas) {
      cliente.tarefasConcluidas = [];
    }
    
    if (!cliente.tarefasConcluidas.includes(tarefaId)) {
      // Adicionar tarefa às concluídas
      cliente.tarefasConcluidas.push(tarefaId);
      
      // INCREMENTAR contador de tarefas completas
      cliente.tarefasCompletas = (cliente.tarefasCompletas || 0) + 1;
      
      // Adicionar capibas ao cliente
      cliente.capibas = (cliente.capibas || 0) + capibas;
      
      await cliente.save();
      
      console.log(`✅ Tarefa ${tarefaId} concluída por cliente ${cliente.nome}. Total: ${cliente.tarefasCompletas} tarefas`);
    }

    res.json({ 
      message: "Tarefa concluída com sucesso", 
      capibas: cliente.capibas,
      tarefasCompletas: cliente.tarefasCompletas, // ← ENVIAR NOVA INFO
      tarefasConcluidas: cliente.tarefasConcluidas 
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao concluir tarefa", error: error.message });
  }
});

module.exports = router;