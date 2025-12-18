const Solicitacao = require("../models/solicitacaoModel");
const Cliente = require("../models/clienteModel");
const mongoose = require("mongoose");

class SolicitacaoController {
    
    /**
     * Obter todas as solicitações (apenas admin)
     * OU apenas as do próprio usuário (se for cliente)
     */
    static async getTodasSolicitacoes(req, res) {
        try {
            const userId = req.headers['user-id'];
            const userType = req.headers['user-type'];
            const userName = req.headers['user-name'];
            
            console.log("🔍 HEADERS recebidos no backend:");
            console.log("   user-id:", userId);
            console.log("   user-type:", userType);
            console.log("   user-name:", userName);
            
            if (!userId || !userType) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }
            
            // Buscar TODAS as solicitações sem filtro
            const solicitacoes = await Solicitacao.find()
                .sort({ createdAt: -1 })
                .lean();
            
            console.log(`📋 ${solicitacoes.length} solicitações encontradas`);
            
            // Se não há solicitações, retornar array vazio
            if (solicitacoes.length === 0) {
                return res.json([]);
            }
            
            // Buscar informações dos usuários de forma segura
            let usuariosMap = {};
            try {
                const userIds = solicitacoes
                    .map(s => s.enviadoPor)
                    .filter(id => id && mongoose.Types.ObjectId.isValid(id))
                    .map(id => new mongoose.Types.ObjectId(id));
                
                if (userIds.length > 0) {
                    const usuarios = await Cliente.find(
                        { _id: { $in: userIds } },
                        { _id: 1, nome: 1, email: 1 }
                    ).lean();
                    
                    // Criar mapa
                    usuarios.forEach(user => {
                        usuariosMap[user._id.toString()] = {
                            _id: user._id,
                            nome: user.nome || "Usuário",
                            email: user.email
                        };
                    });
                }
            } catch (error) {
                console.warn("⚠️ Erro ao buscar usuários, continuando sem dados:", error.message);
            }
            
            // Processar cada solicitação
            const resultado = solicitacoes.map(solicitacao => {
                const usuarioId = solicitacao.enviadoPor?.toString();
                let enviadoPorObj = null;
                
                // Se temos o usuário no mapa
                if (usuarioId && usuariosMap[usuarioId]) {
                    enviadoPorObj = usuariosMap[usuarioId];
                } 
                // Se não encontrou, criar objeto básico
                else {
                    enviadoPorObj = {
                        _id: usuarioId,
                        nome: solicitacao.nomeUsuario || "Usuário"
                    };
                }
                
                return {
                    ...solicitacao,
                    enviadoPor: enviadoPorObj,
                    nomeUsuario: solicitacao.nomeUsuario || enviadoPorObj.nome || "Usuário"
                };
            });
            
            console.log("✅ Solicitações processadas com sucesso");
            
            res.json(resultado);
            
        } catch (error) {
            console.error("❌ ERRO CRÍTICO no backend:", error);
            console.error("Stack trace:", error.stack);
            
            // Retornar erro mais informativo
            res.status(500).json({ 
                message: "Erro interno no servidor",
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * Criar nova solicitação
     */
    static async criarSolicitacao(req, res) {
        try {
            const { nome, msg, capibas } = req.body;
            const userId = req.headers['user-id'];
            const userName = req.headers['user-name'];

            console.log("📝 Criando solicitação para:", {
                userId,
                userName,
                nomeTarefa: nome
            });

            // Validação
            if (!nome?.trim() || !msg?.trim()) {
                return res.status(400).json({ message: "Nome e mensagem são obrigatórios" });
            }

            // Verificar se o usuário existe
            const usuario = await Cliente.findById(userId);
            if (!usuario) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }

            // Criar nova solicitação
            const novaSolicitacao = new Solicitacao({
                nome: nome.trim(),
                msg: msg.trim(),
                capibas: parseInt(capibas) || 0,
                status: 'pendente',
                enviadoPor: userId,
                nomeUsuario: userName || usuario.nome
            });

            await novaSolicitacao.save();

            // Atualizar usuário
            usuario.solicitacoesEnviadas.push(novaSolicitacao._id);
            await usuario.save();

            console.log("✅ Solicitação criada:", {
                id: novaSolicitacao._id,
                solicitante: novaSolicitacao.nomeUsuario
            });

            res.status(201).json({
                message: "Solicitação criada com sucesso!",
                solicitacao: novaSolicitacao
            });

        } catch (error) {
            console.error("❌ Erro ao criar solicitação:", error);
            res.status(500).json({ message: "Erro ao criar solicitação" });
        }
    }

    /**
     * Atualizar solicitação - apenas o dono pode atualizar
     */
    static async atualizarSolicitacao(req, res) {
        try {
            const { id } = req.params;
            const { nome, msg, capibas } = req.body;
            const userId = req.headers['user-id'];

            console.log("✏️ Atualizando solicitação:", id, "por usuário:", userId);

            // Validar ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            // Buscar solicitação
            const solicitacao = await Solicitacao.findById(id);
            if (!solicitacao) {
                return res.status(404).json({ message: "Solicitação não encontrada" });
            }

            // Verificar se o usuário é o dono
            if (solicitacao.enviadoPor.toString() !== userId) {
                return res.status(403).json({ 
                    message: "Você não tem permissão para atualizar esta solicitação" 
                });
            }

            // Verificar se ainda está pendente
            if (solicitacao.status !== 'pendente') {
                return res.status(400).json({ 
                    message: "Não é possível atualizar uma solicitação já revisada" 
                });
            }

            // Atualizar campos
            if (nome?.trim()) solicitacao.nome = nome.trim();
            if (msg?.trim()) solicitacao.msg = msg.trim();
            if (capibas !== undefined) solicitacao.capibas = parseInt(capibas) || 0;

            solicitacao.updatedAt = new Date();
            await solicitacao.save();

            console.log("✅ Solicitação atualizada:", id);

            res.json({
                message: "Solicitação atualizada com sucesso",
                solicitacao
            });

        } catch (error) {
            console.error("❌ Erro ao atualizar solicitação:", error);
            res.status(500).json({ message: "Erro ao atualizar solicitação" });
        }
    }

    /**
     * Deletar solicitação - apenas dono ou admin
     */
    // solicitacaoController.js - método deletarSolicitacao CORRIGIDO
    static async deletarSolicitacao(req, res) {
        try {
            const { id } = req.params;
            const userId = req.headers['user-id'];
            const userType = req.headers['user-type'];

            console.log("🗑️ Deletando solicitação:", id, "por:", userId);

            // Validar ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            // Buscar solicitação
            const solicitacao = await Solicitacao.findById(id);
            if (!solicitacao) {
                return res.status(404).json({ message: "Solicitação não encontrada" });
            }

            console.log("📋 Solicitação encontrada:", {
                id: solicitacao._id,
                nome: solicitacao.nome,
                enviadoPor: solicitacao.enviadoPor,
                tipoEnviadoPor: typeof solicitacao.enviadoPor
            });

            // Verificar permissões - CORREÇÃO AQUI
            let isOwner = false;
            let isAdmin = userType === 'admin';
            
            // Verificar se enviadoPor existe e não é undefined/null
            if (solicitacao.enviadoPor) {
                // Converter para string para comparar
                const enviadoPorStr = solicitacao.enviadoPor.toString();
                isOwner = enviadoPorStr === userId;
                
                console.log("🔐 Comparando IDs:", {
                    enviadoPor: enviadoPorStr,
                    userId: userId,
                    isOwner: isOwner
                });
            } else {
                console.log("⚠️ Solicitação sem enviadoPor definido");
            }
            
            if (!isOwner && !isAdmin) {
                return res.status(403).json({ 
                    message: "Você não tem permissão para excluir esta solicitação" 
                });
            }

            // Remover do array do usuário se for o dono
            if (isOwner) {
                try {
                    const usuario = await Cliente.findById(userId);
                    if (usuario && usuario.solicitacoesEnviadas) {
                        usuario.solicitacoesEnviadas = usuario.solicitacoesEnviadas.filter(
                            solId => solId.toString() !== id
                        );
                        await usuario.save();
                    }
                } catch (userError) {
                    console.warn("⚠️ Erro ao atualizar usuário:", userError.message);
                }
            }

            // Deletar a solicitação
            await Solicitacao.findByIdAndDelete(id);

            console.log("✅ Solicitação deletada:", id);

            res.json({ message: "Solicitação deletada com sucesso" });

        } catch (error) {
            console.error("❌ Erro ao deletar solicitação:", error);
            console.error("Stack trace:", error.stack);
            res.status(500).json({ 
                message: "Erro ao deletar solicitação",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Aprovar solicitação (apenas admin)
     */
    static async aprovarSolicitacao(req, res) {
        try {
            const { id } = req.params;
            const userType = req.headers['user-type'];
            const userName = req.headers['user-name'];

            console.log("✅ Aprovando solicitação:", id);

            // Verificar se é admin
            if (userType !== 'admin') {
                return res.status(403).json({ 
                    message: "Apenas administradores podem aprovar solicitações" 
                });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            const solicitacao = await Solicitacao.findByIdAndUpdate(
                id,
                { 
                    status: 'aprovada',
                    updatedAt: new Date(),
                    aprovadoPor: userName
                },
                { new: true }
            );

            if (!solicitacao) {
                return res.status(404).json({ message: "Solicitação não encontrada" });
            }

            console.log("✅ Solicitação aprovada:", id);

            res.json({
                message: "Solicitação aprovada com sucesso!",
                solicitacao
            });

        } catch (error) {
            console.error("❌ Erro ao aprovar solicitação:", error);
            res.status(500).json({ message: "Erro ao aprovar solicitação" });
        }
    }

    /**
     * Rejeitar solicitação (apenas admin)
     */
    static async rejeitarSolicitacao(req, res) {
        try {
            const { id } = req.params;
            const { motivo } = req.body;
            const userType = req.headers['user-type'];
            const userName = req.headers['user-name'];

            console.log("❌ Rejeitando solicitação:", id);

            // Verificar se é admin
            if (userType !== 'admin') {
                return res.status(403).json({ 
                    message: "Apenas administradores podem rejeitar solicitações" 
                });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            const solicitacao = await Solicitacao.findByIdAndUpdate(
                id,
                { 
                    status: 'rejeitada',
                    updatedAt: new Date(),
                    motivoRejeicao: motivo || 'Sem motivo informado',
                    aprovadoPor: userName
                },
                { new: true }
            );

            if (!solicitacao) {
                return res.status(404).json({ message: "Solicitação não encontrada" });
            }

            console.log("✅ Solicitação rejeitada:", id);

            res.json({
                message: "Solicitação rejeitada",
                solicitacao
            });

        } catch (error) {
            console.error("❌ Erro ao rejeitar solicitação:", error);
            res.status(500).json({ message: "Erro ao rejeitar solicitação" });
        }
    }
    
    /**
     * NOVA ROTA: Obter nome do solicitante para uma solicitação específica
     * Pode ser útil para debug ou para outros usos
     */
    static async getNomeSolicitante(req, res) {
        try {
            const { id } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID inválido" });
            }
            
            const solicitacao = await Solicitacao.findById(id)
                .populate('enviadoPor', 'nome email')
                .lean();
                
            if (!solicitacao) {
                return res.status(404).json({ message: "Solicitação não encontrada" });
            }
            
            let nomeSolicitante = "Usuário desconhecido";
            
            if (solicitacao.enviadoPor && typeof solicitacao.enviadoPor === 'object') {
                nomeSolicitante = solicitacao.enviadoPor.nome || solicitacao.nomeUsuario || "Usuário";
            } else if (solicitacao.nomeUsuario) {
                nomeSolicitante = solicitacao.nomeUsuario;
            }
            
            res.json({
                id: solicitacao._id,
                nomeSolicitante,
                enviadoPor: solicitacao.enviadoPor,
                nomeUsuario: solicitacao.nomeUsuario
            });
            
        } catch (error) {
            console.error("❌ Erro ao buscar nome do solicitante:", error);
            res.status(500).json({ message: "Erro ao buscar nome do solicitante" });
        }
    }
}

module.exports = SolicitacaoController;