const Admin = require("../models/adminModel")
const Pino = require("../models/PinoModel")

const adminController = {
  // Criar admin
  criarAdmin: async (req, res) => {
    try {
      const { nome, email, registroDePinos, nivelDeAcesso } = req.body

      const novoAdmin = new Admin({
        nome: nome,
        email: email,
        registroDePinos: registroDePinos || 0,
        nivelDeAcesso: nivelDeAcesso || 1
      })

      const adminSalvo = await novoAdmin.save()
      
      res.json({
        success: true,
        message: "Admin criado com sucesso!",
        data: adminSalvo
      })

    } catch (err) {
      res.status(500).json({
        success: false,
        error: "Erro ao criar admin: " + err.message
      })
    }
  },

  // Listar admins
  listarAdmins: async (req, res) => {
    try {
      const admins = await Admin.find()
      res.json(admins)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Deletar admin
  deletarAdmin: async (req, res) => {
    try {
      const adminId = req.params.id
      const adminDeletado = await Admin.findByIdAndDelete(adminId)

      if (!adminDeletado) {
        return res.status(404).json({ error: "Admin não encontrado" })
      }

      res.json({ message: "Admin deletado com sucesso" })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
}

module.exports = adminController