const express = require('express');
const router = express.Router();
const Admin = require('../models/adminModel');
const Cliente = require('../models/clienteModel');

// GET /api/usuarios/byEmail?email=...
router.get('/byEmail', async (req, res) => {
  const { email } = req.query;
  try {
    // Primeiro procura nos admins
    let usuario = await Admin.findOne({ email });
    if (usuario) {
      return res.json({ tipo: 'admin', email: usuario.email, nome: usuario.nome });
    }

    // Se não achou, procura nos clientes
    usuario = await Cliente.findOne({ email });
    if (usuario) {
      return res.json({ tipo: 'cliente', email: usuario.email, nome: usuario.nome });
    }

    // Se não achou em nenhum dos dois
    return res.status(404).json({ message: 'Usuário não encontrado' });
  } catch (error) {
    console.error('❌ Erro ao buscar usuário por email:', error);
    res.status(500).json({ message: 'Erro interno ao buscar usuário' });
  }
});

module.exports = router;
