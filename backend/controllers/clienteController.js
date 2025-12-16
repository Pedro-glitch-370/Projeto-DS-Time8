const Cliente = require("../models/clienteModel");
const Grupo = require("../models/grupoModel"); 

// ================== CONTROLADOR CLIENTE ==================

class ClienteController {
    // ========== AUTENTICAÇÃO ==========

    /**
     * Registrar novo cliente no sistema
     */
    static async registrarCliente(req, res) {
        try {
            const { nome, email, senha } = req.body;

            console.log("📝 Recebendo registro de cliente:", { nome, email });

            // Validação dos campos obrigatórios
            if (!nome || !email || !senha) {
                return res.status(400).json({ message: "Nome, email e senha são obrigatórios" });
            }

            // Verificar se o cliente já existe
            const existingCliente = await Cliente.findOne({ email });
            if (existingCliente) {
                return res.status(400).json({ message: "Cliente já existe com este email" });
            }

            // Criar novo cliente com valores padrão
            const newCliente = new Cliente({
                nome,
                email,
                senha,
                tipo: 'cliente',
                capibas: 0,
                tarefasCompletas: 0,
                tarefasConcluidas: []
            });

            await newCliente.save();

            console.log("✅ Cliente registrado com sucesso:", newCliente._id);

            res.status(201).json({ 
                message: "Cliente registrado com sucesso",
                user: {
                    id: newCliente._id,
                    nome: newCliente.nome,
                    email: newCliente.email,
                    senha: newCliente.senha,
                    tipo: newCliente.tipo,
                    capibas: newCliente.capibas,
                    tarefasCompletas: newCliente.tarefasCompletas
                }
            });

        } catch (error) {
            console.error("❌ Erro no registro do cliente:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    /**
     * Realizar login do cliente
     */
    static async loginCliente(req, res) {
        try {
            const { email, senha } = req.body;

            console.log("🔐 Recebendo login de cliente para email:", email);

            // Validar email e senha
            if (!email || !senha) {
                return res.status(400).json({ message: "Email e senha são obrigatórios" });
            }

            const cliente = await Cliente.findOne({ email }).populate({
                path: 'grupo',
                populate: { path: 'membros', select: 'nome capibas' } 
            });
            
            console.log("🔍 DEBUG: Cliente encontrado:", cliente ? cliente.email : "Não encontrado");
            
            if (!cliente) {
                return res.status(400).json({ message: "Cliente não encontrado. Faça o registro primeiro." });
            }

            if (cliente.senha !== senha) {
                return res.status(401).json({ message: "Senha incorreta" });
            }

            console.log("✅ Login de cliente bem-sucedido para:", cliente.email);

            res.json({
                message: "Login realizado com sucesso",
                user: {
                    id: cliente._id,
                    nome: cliente.nome,
                    email: cliente.email,
                    senha: cliente.senha,
                    tipo: 'cliente',
                    capibas: cliente.capibas,
                    grupo: cliente.grupo, // Agora vem com a lista de membros preenchida!
                    tarefasCompletas: cliente.tarefasCompletas,
                    tarefasConcluidas: cliente.tarefasConcluidas || []
                }
            });

        } catch (error) {
            console.error("❌ Erro no login do cliente:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // ========== GERENCIAMENTO DE CLIENTES ==========

    /**
     * Listar todos os clientes cadastrados
     */
    static async listarClientes(req, res) {
        try {
            console.log("📋 Buscando todos os clientes...");
            const clientes = await Cliente.find({}, { nome: 1, email: 1, capibas: 1, tipo: 1, tarefasCompletas: 1, grupo: 1 });
            console.log(`✅ ${clientes.length} clientes encontrados`);
            res.json(clientes);
        } catch (error) {
            console.error("❌ Erro ao buscar clientes:", error);
            res.status(500).json({ message: "Erro ao buscar clientes" });
        }
    }

    /**
     * Buscar cliente específico por email
     */
    static async buscarClientePorEmail(req, res) {
        try {
            const { email } = req.params;

            console.log("🔍 Buscando cliente por email:", email);

            const cliente = await Cliente.findOne({ email }).populate({
                path: 'grupo',
                populate: { path: 'membros', select: 'nome capibas' }
            });

            if (!cliente) {
                return res.status(404).json({ message: "Cliente não encontrado" });
            }

            console.log("✅ Cliente encontrado:", cliente.email);

            res.json({
                user: {
                    id: cliente._id,
                    nome: cliente.nome,
                    email: cliente.email,
                    senha: cliente.senha,
                    tipo: 'cliente',
                    capibas: cliente.capibas,
                    grupo: cliente.grupo,
                    tarefasCompletas: cliente.tarefasCompletas,
                    tarefasConcluidas: cliente.tarefasConcluidas || []
                }
            });

        } catch (error) {
            console.error("Erro ao buscar cliente por email:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    /**
     * Buscar cliente específico por ID
     */
    static async buscarClientePorId(req, res) {
        try {
            const { id } = req.params;

            console.log("🔍 Buscando cliente por ID:", id);

            // CORREÇÃO: POPULATE ANINHADO
            const cliente = await Cliente.findById(id).populate({
                path: 'grupo',
                populate: { path: 'membros', select: 'nome capibas' }
            });

            if (!cliente) {
                return res.status(404).json({ message: "Cliente não encontrado" });
            }

            console.log("✅ Cliente encontrado:", cliente.email);

            res.json({
                user: {
                    id: cliente._id,
                    nome: cliente.nome,
                    email: cliente.email,
                    senha: cliente.senha,
                    tipo: 'cliente',
                    capibas: cliente.capibas,
                    grupo: cliente.grupo,
                    tarefasCompletas: cliente.tarefasCompletas,
                    tarefasConcluidas: cliente.tarefasConcluidas || []
                }
            });

        } catch (error) {
            console.error("Erro ao buscar cliente por ID:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // ========== GERENCIAMENTO DE TAREFAS ==========

    /**
     * Concluir tarefa e adicionar capibas ao cliente e ao grupo
     */
    static async concluirTarefa(req, res) {
        try {
            const { id } = req.params;
            const { tarefaId, capibas } = req.body;

            console.log(`🎯 Cliente ${id} concluindo tarefa ${tarefaId} por ${capibas} capibas`);

            // Validar dados obrigatórios
            if (!tarefaId || capibas === undefined) {
                return res.status(400).json({ message: 'tarefaId e capibas são obrigatórios' });
            }

            // Buscar cliente pelo ID
            const cliente = await Cliente.findById(id);
            if (!cliente) {
                return res.status(404).json({ message: "Cliente não encontrado" });
            }

            // Inicializar array de tarefas concluídas se não existir
            if (!cliente.tarefasConcluidas) {
                cliente.tarefasConcluidas = [];
            }

            // Verificar se a tarefa já foi concluída
            if (cliente.tarefasConcluidas.includes(tarefaId)) {
                return res.status(400).json({ 
                    message: "Tarefa já concluída",
                    capibas: cliente.capibas,
                    tarefasCompletas: cliente.tarefasCompletas,
                    tarefasConcluidas: cliente.tarefasConcluidas
                });
            }

            // Adicionar tarefa à lista de concluídas
            cliente.tarefasConcluidas.push(tarefaId);
            
            // Incrementar contador de tarefas completas
            cliente.tarefasCompletas = (cliente.tarefasCompletas || 0) + 1;
            
            // Adicionar capibas ao saldo do cliente
            cliente.capibas = (cliente.capibas || 0) + capibas;

            // Se o usuário tem grupo, o grupo também ganha os pontos
            if (cliente.grupo) {
                try {
                    await Grupo.findByIdAndUpdate(cliente.grupo, {
                        $inc: { pontuacaoTotal: capibas }
                    });
                    console.log(`🆙 Grupo do usuário atualizado com +${capibas} pontos`);
                } catch (errGrupo) {
                    console.error("Erro ao atualizar grupo:", errGrupo);
                }
            }
            
            await cliente.save();
            
            console.log(`✅ Tarefa ${tarefaId} concluída por ${cliente.nome}. Total: ${cliente.tarefasCompletas} tarefas, ${cliente.capibas} capibas`);

            res.json({ 
                message: "Tarefa concluída com sucesso", 
                capibas: cliente.capibas,
                tarefasCompletas: cliente.tarefasCompletas,
                tarefasConcluidas: cliente.tarefasConcluidas 
            });

        } catch (error) {
            console.error("❌ Erro ao concluir tarefa:", error);
            res.status(500).json({ message: "Erro interno do servidor", error: error.message });
        }
    }

    // ========== OPERAÇÕES ADMINISTRATIVAS ==========

    /**
     * Excluir cliente do sistema
     */
    static async deletarCliente(req, res) {
        try {
            const { id } = req.params;
            
            console.log("🗑️ Tentando deletar cliente ID:", id);

            // Verificar se o cliente existe
            const cliente = await Cliente.findById(id);
            if (!cliente) {
                return res.status(404).json({ message: "Cliente não encontrado" });
            }

            await Cliente.findByIdAndDelete(id);
            
            console.log("✅ Cliente deletado com sucesso:", id);
            res.json({ message: "Cliente deletado com sucesso" });

        } catch (error) {
            console.error("❌ Erro ao deletar cliente:", error);
            res.status(500).json({ message: "Erro ao deletar cliente" });
        }
    }
}

module.exports = ClienteController;