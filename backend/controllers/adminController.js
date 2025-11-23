const Admin = require("../models/adminModel");
const mongoose = require("mongoose");

// ================== CONTROLADOR ADMIN ==================

class AdminController {
    // ========== AUTENTICAÇÃO ==========

    // Registrar admin
    static async registrarAdmin(req, res) {
        try {
            const { nome, email } = req.body;

            console.log("📝 Recebendo registro de admin:", { nome, email });

            // Validação
            if (!nome?.trim()) {
                return res.status(400).json({ message: "Nome é obrigatório" });
            }

            if (!email?.trim()) {
                return res.status(400).json({ message: "Email é obrigatório" });
            }

            // Verifica se o admin já existe
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                return res.status(400).json({ message: "Admin já existe com este email" });
            }

            // Cria novo admin (SEM capibas)
            const newAdmin = new Admin({
                nome: nome.trim(),
                email: email.trim(),
                tipo: 'admin'
                // Os outros campos usam os defaults do model
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
                    permissoes: newAdmin.permissoes,
                    tarefasCompletas: newAdmin.tarefasCompletas
                    // SEM capibas no retorno
                }
            });

        } catch (error) {
            console.error("❌ Erro no registro do admin:", error);
            
            if (error.code === 11000) {
                return res.status(400).json({ message: "Email já está em uso" });
            }
            
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // Login de admin
    static async loginAdmin(req, res) {
        try {
            const { email } = req.body;

            console.log("🔐 Recebendo login de admin para email:", email);

            if (!email?.trim()) {
                return res.status(400).json({ message: "Email é obrigatório" });
            }

            // Busca admin pelo email
            const admin = await Admin.findOne({ email });
            
            if (!admin) {
                return res.status(400).json({ message: "Admin não encontrado. Faça o registro primeiro." });
            }

            console.log("✅ Login de admin bem-sucedido para:", admin.email);

            // Retorna dados do admin (SEM capibas)
            res.json({
                message: "Login realizado com sucesso",
                user: {
                    id: admin._id,
                    nome: admin.nome,
                    email: admin.email,
                    tipo: 'admin',
                    permissoes: admin.permissoes,
                    tarefasCompletas: admin.tarefasCompletas,
                    tarefasConcluidas: admin.tarefasConcluidas || []
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
            const admins = await Admin.find({}, { nome: 1, email: 1, permissoes: 1, tipo: 1, tarefasCompletas: 1 });
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
                    permissoes: admin.permissoes,
                    tarefasCompletas: admin.tarefasCompletas,
                    tarefasConcluidas: admin.tarefasConcluidas || []
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

            // Validar ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID do admin inválido" });
            }

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
                    permissoes: admin.permissoes,
                    tarefasCompletas: admin.tarefasCompletas,
                    tarefasConcluidas: admin.tarefasConcluidas || []
                }
            });

        } catch (error) {
            console.error("Erro ao buscar admin por ID:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // Testar tarefa (admin não ganha capibas)
    static async concluirTarefa(req, res) {
        try {
            const { id } = req.params;
            const { tarefaId, capibas } = req.body;

            console.log(`🎯 Admin ${id} TESTANDO tarefa ${tarefaId} (${capibas} capibas)`);

            // Validações
            if (!tarefaId?.trim()) {
                return res.status(400).json({ message: "ID da tarefa é obrigatório" });
            }

            // Validar ID do admin
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID do admin inválido" });
            }

            const admin = await Admin.findById(id);
            if (!admin) {
                return res.status(404).json({ message: "Admin não encontrado" });
            }

            // Verificar se a tarefa já foi testada
            if (admin.tarefasConcluidas.includes(tarefaId)) {
                return res.status(400).json({ 
                    message: "Tarefa já testada",
                    tarefasCompletas: admin.tarefasCompletas
                });
            }

            // Apenas registrar que testou a tarefa (SEM GANHAR CAPIBAS)
            admin.tarefasConcluidas.push(tarefaId);
            admin.tarefasCompletas += 1;
            admin.ultimoAcesso = new Date();
            
            await admin.save();
            
            console.log(`✅ Admin ${admin.nome} testou tarefa ${tarefaId}. Total testadas: ${admin.tarefasCompletas}`);

            res.json({ 
                message: "Tarefa testada com sucesso", 
                tarefasCompletas: admin.tarefasCompletas,
                observacao: "Admin não recebe capibas - apenas teste"
            });

        } catch (error) {
            console.error("❌ Erro ao testar tarefa:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // Deletar admin
    static async deletarAdmin(req, res) {
        try {
            const { id } = req.params;
            
            console.log("🗑️ Tentando deletar admin ID:", id);

            // Validar ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID do admin inválido" });
            }

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