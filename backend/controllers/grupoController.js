const Grupo = require("../models/grupoModel");
const Cliente = require("../models/clienteModel");

class GrupoController {

    /* criar grupo */
    static async criarGrupo(req, res) {
        try {
            const { nome, descricao, usuarioId } = req.body;

            // Verificar se o usuário já está em um grupo
            const usuario = await Cliente.findById(usuarioId);
            if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });
            
            if (usuario.grupo) {
                return res.status(400).json({ message: "Você já participa de um grupo. Saia dele antes de criar um novo." });
            }

            // Gerar código único (Ex: #XK9LP)
            const codigo = '#' + Math.random().toString(36).substring(2, 8).toUpperCase();

            // Criar o grupo
            const novoGrupo = new Grupo({
                nome,
                descricao,
                codigo,
                lider: usuarioId,
                membros: [usuarioId],
                pontuacaoTotal: 0
            });

            await novoGrupo.save();

            // Atualizar o usuário
            usuario.grupo = novoGrupo._id;
            await usuario.save();

            res.status(201).json({ message: "Grupo criado com sucesso!", grupo: novoGrupo });

        } catch (error) {
            console.error(error);
            // Tratamento para nome duplicado (erro 11000 do Mongo)
            if (error.code === 11000) {
                return res.status(400).json({ message: "Já existe um grupo com este nome." });
            }
            res.status(500).json({ message: "Erro ao criar grupo", error: error.message });
        }
    }

    /* entrar grupo */
    static async entrarGrupo(req, res) {
        try {
            const { codigo, usuarioId } = req.body;

            // Achar o grupo
            const grupo = await Grupo.findOne({ codigo });
            if (!grupo) {
                return res.status(404).json({ message: "Grupo não encontrado com este código." });
            }

            // Verificar se o grupo está cheio (Máximo 5 pessoas)
            if (grupo.membros.length >= 5) {
                return res.status(400).json({ message: "Este grupo já atingiu o limite de 5 aventureiros." });
            }

            // Verificar usuário
            const usuario = await Cliente.findById(usuarioId);
            if (usuario.grupo) {
                return res.status(400).json({ message: "Você já tem um grupo." });
            }

            // Adicionar usuário ao grupo
            grupo.membros.push(usuarioId);
            await grupo.save();

            // Vincular grupo ao usuário
            usuario.grupo = grupo._id;
            await usuario.save();

            res.status(200).json({ message: `Bem-vindo ao grupo ${grupo.nome}!`, grupo });

        } catch (error) {
            res.status(500).json({ message: "Erro ao entrar no grupo", error: error.message });
        }
    }

    /* sair grupo */
    static async sairGrupo(req, res) {
        try {
            const { usuarioId } = req.body;

            console.log("🏃‍♂️ Usuário saindo:", usuarioId);

            // Achar o usuário
            const usuario = await Cliente.findById(usuarioId);
            if (!usuario || !usuario.grupo) {
                return res.status(400).json({ message: "Usuário não possui grupo." });
            }

            const grupoId = usuario.grupo;
            const grupo = await Grupo.findById(grupoId);

            if (!grupo) {
                // Caso raro: o usuário tem o ID no perfil, mas o grupo não existe mais
                usuario.grupo = null;
                await usuario.save();
                return res.json({ message: "Grupo não existia, perfil limpo." });
            }

            // Lógica de Saída e Liderança
            // Verifica se quem está saindo é o LÍDER
            const ehLider = grupo.lider.toString() === usuarioId;

            // Remove o usuário da lista de membros
            const novosMembros = grupo.membros.filter(id => id.toString() !== usuarioId);
            grupo.membros = novosMembros;

            // CASO A: Grupo ficou vazio -> Deleta
            if (grupo.membros.length === 0) {
                await Grupo.findByIdAndDelete(grupoId);
                console.log("🗑️ Grupo deletado (ficou vazio).");
            } 
            // CASO B: Grupo ainda tem gente
            else {
                // Se era o líder saindo, passa a coroa para o próximo da fila (o membro mais antigo)
                if (ehLider) {
                    grupo.lider = grupo.membros[0];
                    console.log(`👑 Nova liderança: ${grupo.lider}`);
                }
                await grupo.save();
            }

            // Atualizar usuário (finalmente remove o vínculo)
            usuario.grupo = null;
            await usuario.save();

            res.status(200).json({ message: "Você saiu do grupo com sucesso." });

        } catch (error) {
            console.error("Erro ao sair do grupo:", error);
            res.status(500).json({ message: "Erro ao sair do grupo", error: error.message });
        }
    }

    /* ranqueia os grupos */
    static async rankingGrupos(req, res) {
        try {
            const ranking = await Grupo.find({}, 'nome pontuacaoTotal lider membros')
                .sort({ pontuacaoTotal: -1 })
                .limit(10)
                .populate('lider', 'nome'); // Traz o nome do líder

            res.json(ranking);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar ranking" });
        }
    }
}

module.exports = GrupoController;