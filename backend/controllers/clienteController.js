const Cliente = require("../models/clienteModel");

// ================== CONTROLADOR CLIENTE ==================

class ClienteController {
    // ========== AUTENTICAÇÃO ==========

    // Registrar cliente
    static async registrarCliente(req, res) {
        try {
            const { nome, email } = req.body;

            console.log("📝 Recebendo registro de cliente:", { nome, email });

            // Validação
            if (!nome || !email) {
                return res.status(400).json({ message: "Nome e email são obrigatórios" });
            }

            // Verifica se o cliente já existe
            const existingCliente = await Cliente.findOne({ email });
            if (existingCliente) {
                return res.status(400).json({ message: "Cliente já existe com este email" });
            }

            // Cria novo cliente
            const newCliente = new Cliente({
                nome,
                email,
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

    // Login de cliente
    static async loginCliente(req, res) {
        try {
            const { email } = req.body;

            console.log("🔐 Recebendo login de cliente para email:", email);

            if (!email) {
                return res.status(400).json({ message: "Email é obrigatório" });
            }

            // Busca cliente pelo email
            const cliente = await Cliente.findOne({ email });
            console.log("🔍 DEBUG: Cliente encontrado:", cliente);
            
            if (!cliente) {
                return res.status(400).json({ message: "Cliente não encontrado. Faça o registro primeiro." });
            }

            console.log("✅ Login de cliente bem-sucedido para:", cliente.email);

            // Retorna dados do cliente
            res.json({
                message: "Login realizado com sucesso",
                user: {
                    id: cliente._id,
                    nome: cliente.nome,
                    email: cliente.email,
                    tipo: 'cliente',
                    capibas: cliente.capibas,
                    tarefasCompletas: cliente.tarefasCompletas,
                    tarefasConcluidas: cliente.tarefasConcluidas || []
                }
            });

        } catch (error) {
            console.error("❌ Erro no login do cliente:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // ========== GERENCIAMENTO ==========

    // Listar todos os clientes
    static async listarClientes(req, res) {
        try {
            console.log("📋 Buscando todos os clientes...");
            const clientes = await Cliente.find({}, { nome: 1, email: 1, capibas: 1, tarefasCompletas: 1, tipo: 1 });
            console.log(`✅ ${clientes.length} clientes encontrados`);
            res.json(clientes);
        } catch (error) {
            console.error("❌ Erro ao buscar clientes:", error);
            res.status(500).json({ message: "Erro ao buscar clientes" });
        }
    }

    // Buscar cliente por email
    static async buscarClientePorEmail(req, res) {
        try {
            const { email } = req.params;

            console.log("🔍 Buscando cliente por email:", email);

            const cliente = await Cliente.findOne({ email });
            if (!cliente) {
                return res.status(404).json({ message: "Cliente não encontrado" });
            }

            console.log("✅ Cliente encontrado:", cliente.email);

            res.json({
                user: {
                    id: cliente._id,
                    nome: cliente.nome,
                    email: cliente.email,
                    tipo: 'cliente',
                    capibas: cliente.capibas,
                    tarefasCompletas: cliente.tarefasCompletas,
                    tarefasConcluidas: cliente.tarefasConcluidas || []
                }
            });

        } catch (error) {
            console.error("Erro ao buscar cliente por email:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // Buscar cliente por ID
    static async buscarClientePorId(req, res) {
        try {
            const { id } = req.params;

            console.log("🔍 Buscando cliente por ID:", id);

            const cliente = await Cliente.findById(id);
            if (!cliente) {
                return res.status(404).json({ message: "Cliente não encontrado" });
            }

            console.log("✅ Cliente encontrado:", cliente.email);

            res.json({
                user: {
                    id: cliente._id,
                    nome: cliente.nome,
                    email: cliente.email,
                    tipo: 'cliente',
                    capibas: cliente.capibas,
                    tarefasCompletas: cliente.tarefasCompletas,
                    tarefasConcluidas: cliente.tarefasConcluidas || []
                }
            });

        } catch (error) {
            console.error("Erro ao buscar cliente por ID:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    // Concluir tarefa
    static async concluirTarefa(req, res) {
        try {
            const { id } = req.params;
            const { tarefaId, capibas } = req.body;

            console.log(`🎯 Cliente ${id} concluindo tarefa ${tarefaId} por ${capibas} capibas`);

            // Validação
            if (!tarefaId || !capibas) {
                return res.status(400).json({ message: "tarefaId e capibas são obrigatórios" });
            }

            const cliente = await Cliente.findById(id);
            if (!cliente) {
                return res.status(404).json({ message: "Cliente não encontrado" });
            }

            // Inicializar arrays se não existirem
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

            // Adicionar tarefa às concluídas
            cliente.tarefasConcluidas.push(tarefaId);
            
            // Incrementar contador de tarefas completas
            cliente.tarefasCompletas = (cliente.tarefasCompletas || 0) + 1;
            
            // Adicionar capibas ao cliente
            cliente.capibas = (cliente.capibas || 0) + capibas;
            
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

    // Deletar cliente
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