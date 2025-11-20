const express = require("express")
const router = express.Router()
const User = require("../models/clienteModel") // Agora está correto

// REGISTRO - cria novo usuário
router.post("/register", async (req, res) => {
    try {
        const { nome, email, tipo = 'cliente' } = req.body

        console.log("📝 Recebendo registro:", { nome, email, tipo })

        // Validação
        if (!nome || !email) {
            return res.status(400).json({ message: "Nome e email são obrigatórios" })
        }

        // Verifica se o usuário já existe
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "Usuário já existe com este email" })
        }

        // Cria novo usuário
        const newUser = new User({
            nome,
            email,
            tipo,
            nivelDeAcesso: tipo === 'admin' ? 1 : 0
        })

        await newUser.save()

        console.log("✅ Usuário registrado com sucesso:", newUser._id)

        res.status(201).json({ 
            message: "Usuário registrado com sucesso",
            user: {
                id: newUser._id,
                nome: newUser.nome,
                email: newUser.email,
                tipo: newUser.tipo,
                nivelDeAcesso: newUser.nivelDeAcesso,
                capibas: newUser.capibas
            }
        })

    } catch (error) {
        console.error("❌ Erro no registro:", error)
        res.status(500).json({ message: "Erro interno do servidor" })
    }
})

// LOGIN - apenas verifica se o usuário existe
router.post("/login", async (req, res) => {
    try {
        const { email } = req.body

        console.log("🔐 Recebendo login para email:", email)

        if (!email) {
            return res.status(400).json({ message: "Email é obrigatório" })
        }

        // Busca usuário pelo email
        const user = await User.findOne({ email })
        console.log("🔍 DEBUG: Usuário encontrado:", user)
        
        if (!user) {
            return res.status(400).json({ message: "Usuário não encontrado. Faça o registro primeiro." })
        }

        console.log("✅ Login bem-sucedido para:", user.email)
        console.log("🔑 Tipo de usuário:", user.tipo)
        console.log("🔑 Nível de acesso:", user.nivelDeAcesso)

        // Retorna dados do usuário
        res.json({
            message: "Login realizado com sucesso",
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo,
                nivelDeAcesso: user.nivelDeAcesso,
                capibas: user.capibas
            }
        })

    } catch (error) {
        console.error("❌ Erro no login:", error)
        res.status(500).json({ message: "Erro interno do servidor" })
    }
})

module.exports = router