const Admin = require("../models/adminModel");
const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken"); // REMOVIDO: Não precisamos mais de token

// ================== CONTROLADOR ADMIN ==================
/**
 * Controlador responsável por gerenciar todas as operações relacionadas a administradores
 * Inclui autenticação básica, CRUD e operações específicas de admin
 */
class AdminController {
    // ========== OPERAÇÕES DE AUTENTICAÇÃO ==========

    /**
      * Registra um novo administrador no sistema
      * @param {Object} req - Request do Express
      * @param {Object} req.body - Corpo da requisição
      * @param {string} req.body.nome - Nome do administrador
      * @param {string} req.body.email - Email do administrador
      * @param {string} req.body.senha - Senha do administrador
      * @param {Object} res - Response do Express
      */
    static async registrarAdmin(req, res) {
        try {
            const { nome, email, senha } = req.body;

            console.log("📝 Recebendo registro de admin:", { nome, email, senha });

            // Validação de campos obrigatórios
            if (!nome?.trim()) {
                return res.status(400).json({ message: "Nome é obrigatório" });
            }

            if (!email?.trim()) {
                return res.status(400).json({ message: "Email é obrigatório" });
            }

            if (!senha?.trim()) {
                return res.status(400).json({ message: "Senha é obrigatória" });
            }

            // Verifica se o admin já existe pelo email
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                return res.status(400).json({ message: "Admin já existe com este email" });
            }

            // Cria novo admin (SEM capibas - diferenciação importante)
            const newAdmin = new Admin({
                nome: nome.trim(),
                email: email.trim(),
                senha: senha.trim(),
                tipo: 'admin'
                // Os outros campos usam os defaults do model
            });

            await newAdmin.save();

            console.log("✅ Admin registrado com sucesso:", newAdmin._id);

            // Retorna dados do admin sem informações sensíveis
            res.status(201).json({ 
                message: "Admin registrado com sucesso",
                user: {
                    id: newAdmin._id,
                    nome: newAdmin.nome,
                    email: newAdmin.email,
                    senha: newAdmin.senha,
                    tipo: newAdmin.tipo,
                    permissoes: newAdmin.permissoes,
                    tarefasCompletas: newAdmin.tarefasCompletas
                }
            });

        } catch (error) {
            console.error("❌ Erro no registro do admin:", error);
            
            // Tratamento específico para erro de duplicação
            if (error.code === 11000) {
                return res.status(400).json({ message: "Email já está em uso" });
            }
            
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    /**
      * Realiza login de um administrador existente
      * (Apenas verifica senha e retorna os dados, sem gerar Token)
      * @param {Object} req - Request do Express
      * @param {string} req.body.email - Email do administrador
      * @param {string} req.body.senha - Senha do administrador
      * @param {Object} res - Response do Express
      */
    static async loginAdmin(req, res) {
        try {
            const { email, senha } = req.body;

            console.log("🔐 Recebendo login de admin para email:", email);

            // Validação básica
            if (!email?.trim()) {
                return res.status(400).json({ message: "Email é obrigatório" });
            }

            if (!senha?.trim()) {
                return res.status(400).json({ message: "Senha é obrigatória"});
            }

            // Busca admin pelo email
            const admin = await Admin.findOne({ email });
            
            if (!admin) {
                return res.status(400).json({ message: "Admin não encontrado. Faça o registro primeiro." });
            }
            
            // Verifica a senha (Texto puro, conforme solicitado)
            if (admin.senha !== senha) {
                return res.status(401).json({ message: "Senha incorreta" });
            }

            console.log("✅ Login de admin bem-sucedido para:", admin.email);

            // Retorna dados do admin (SEM TOKEN)
            res.json({
                message: "Login realizado com sucesso",
                adminId: admin._id, // Retorna o ID caso queira usar manualmente no futuro
                user: {
                    id: admin._id,
                    nome: admin.nome,
                    email: admin.email,
                    senha: admin.senha,
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

    // ========== OPERAÇÕES DE GERENCIAMENTO ==========

    /**
      * Lista todos os administradores do sistema
      * @param {Object} req - Request do Express
      * @param {Object} res - Response do Express
      */
    static async listarAdmins(req, res) {
        try {
            console.log("📋 Buscando todos os administradores...");
            
            // Busca todos os admins, selecionando apenas campos necessários
            const admins = await Admin.find({}, { 
                nome: 1, 
                email: 1,
                senha: 1,
                permissoes: 1, 
                tipo: 1, 
                tarefasCompletas: 1 
            });
            
            console.log(`✅ ${admins.length} administradores encontrados`);
            res.json(admins);
        } catch (error) {
            console.error("❌ Erro ao buscar admins:", error);
            res.status(500).json({ message: "Erro ao buscar admins" });
        }
    }

    /**
      * Busca um administrador específico pelo email
      * @param {Object} req - Request do Express
      * @param {string} req.params.email - Email do administrador
      * @param {Object} res - Response do Express
      */
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
                    senha: admin.senha,
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

    /**
      * Busca um administrador específico pelo ID
      * @param {Object} req - Request do Express
      * @param {string} req.params.id - ID do administrador
      * @param {Object} res - Response do Express
      */
    static async buscarAdminPorId(req, res) {
        try {
            const { id } = req.params;

            console.log("🔍 Buscando admin por ID:", id);

            // Validar formato do ID do MongoDB
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
                    senha: admin.senha,
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

    /**
      * Permite que um administrador teste uma tarefa
      * DIFERENÇA CHAVE: Admin não recebe capibas, apenas registra o teste
      * @param {Object} req - Request do Express
      * @param {string} req.params.id - ID do administrador
      * @param {Object} req.body - Corpo da requisição
      * @param {string} req.body.tarefaId - ID da tarefa a ser testada
      * @param {Object} res - Response do Express
      */
    static async concluirTarefa(req, res) {
        try {
            const { id } = req.params;
            const { tarefaId } = req.body;

            console.log(`🎯 Admin ${id} TESTANDO tarefa ${tarefaId}`);

            // Validações básicas
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

            // Verificar se a tarefa já foi testada (evitar duplicação)
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

    /**
      * Remove um administrador do sistema
      * @param {Object} req - Request do Express
      * @param {string} req.params.id - ID do administrador a ser deletado
      * @param {Object} res - Response do Express
      */
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