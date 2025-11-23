const Admin = require("../models/adminModel");

// ================== CONTROLADOR ADMIN ==================

class AdminController {
    // ========== AUTENTICAÇÃO ==========

    // Registrar admin
    static async registrarAdmin(req, res) {
        try {
            const { nome, email } = req.body;

            console.log("📝 Recebendo registro de admin:", { nome, email });

            // Validação
            if (!nome || !email) {
                return res.status(400).json({ message: "Nome e email são obrigatórios" });
            }

            // Verifica se o admin já existe
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                return res.status(400).json({ message: "Admin já existe com este email" });
            }

            // Cria novo admin
            const newAdmin = new Admin({
                nome,
                email,
                tipo: 'admin',
                permissoes: ['criar_pinos', 'editar_pinos', 'deletar_pinos', 'gerenciar_usuarios']
            });

            await newAdmin.save();

            console.log("✅ Admin registrado com sucesso:", newAdmin._id);

            res.status(201).json({ 
                message: "Admin registrado com sucesso",
                user: {
                    id: newAdmin._id,
                    nome: newAdmin.nome,
                    email: newAdmin.email,
                    tipo: newAdmin.tipo,
                    permissoes: newAdmin.permissoes
                }
            });

        } catch (error) {
            console.error("❌ Erro no registro do admin:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // Login de admin
    static async loginAdmin(req, res) {
        try {
            const { email } = req.body;

            console.log("🔐 Recebendo login de admin para email:", email);

            if (!email) {
                return res.status(400).json({ message: "Email é obrigatório" });
            }

            // Busca admin pelo email
            const admin = await Admin.findOne({ email });
            console.log("🔍 DEBUG: Admin encontrado:", admin);
            
            if (!admin) {
                return res.status(400).json({ message: "Admin não encontrado. Faça o registro primeiro." });
            }

            console.log("✅ Login de admin bem-sucedido para:", admin.email);

            // Retorna dados do admin
            res.json({
                message: "Login realizado com sucesso",
                user: {
                    id: admin._id,
                    nome: admin.nome,
                    email: admin.email,
                    tipo: 'admin',
                    permissoes: admin.permissoes
                }
            });

        } catch (error) {
            console.error("❌ Erro no login do admin:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // ========== GERENCIAMENTO ==========

    // Listar todos os admins
    static async listarAdmins(req, res) {
        try {
            console.log("📋 Buscando todos os administradores...");
            const admins = await Admin.find({}, { nome: 1, email: 1, permissoes: 1, tipo: 1 });
            console.log(`✅ ${admins.length} administradores encontrados`);
            res.json(admins);
        } catch (error) {
            console.error("❌ Erro ao buscar admins:", error);
            res.status(500).json({ message: "Erro ao buscar admins" });
        }
    }

    // Buscar admin por email
    static async buscarAdminPorEmail(req, res) {
        try {
            const { email } = req.params;

            console.log("🔍 Buscando admin por email:", email);

            const admin = await Admin.findOne({ email });
            if (!admin) {
                return res.status(404).json({ message: "Admin não encontrado" });
            }

            console.log("✅ Admin encontrado:", admin.email);

            res.json({
                user: {
                    id: admin._id,
                    nome: admin.nome,
                    email: admin.email,
                    tipo: 'admin',
                    permissoes: admin.permissoes
                }
            });

        } catch (error) {
            console.error("Erro ao buscar admin por email:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // Buscar admin por ID
    static async buscarAdminPorId(req, res) {
        try {
            const { id } = req.params;

            console.log("🔍 Buscando admin por ID:", id);

            const admin = await Admin.findById(id);
            if (!admin) {
                return res.status(404).json({ message: "Admin não encontrado" });
            }

            console.log("✅ Admin encontrado:", admin.email);

            res.json({
                user: {
                    id: admin._id,
                    nome: admin.nome,
                    email: admin.email,
                    tipo: 'admin',
                    permissoes: admin.permissoes
                }
            });

        } catch (error) {
            console.error("Erro ao buscar admin por ID:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // Deletar admin
    static async deletarAdmin(req, res) {
        try {
            const { id } = req.params;
            
            console.log("🗑️ Tentando deletar admin ID:", id);

            const admin = await Admin.findById(id);
            if (!admin) {
                return res.status(404).json({ message: "Admin não encontrado" });
            }

            await Admin.findByIdAndDelete(id);
            
            console.log("✅ Admin deletado com sucesso:", id);
            res.json({ message: "Admin deletado com sucesso" });

        } catch (error) {
            console.error("❌ Erro ao deletar admin:", error);
            res.status(500).json({ message: "Erro ao deletar admin" });
        }
    }
}

module.exports = AdminController;