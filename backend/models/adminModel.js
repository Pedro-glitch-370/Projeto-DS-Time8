const mongoose = require("mongoose")
const Schema = mongoose.Schema

// esquema dos admins
const adminSchema = new Schema({
    nome: { type: String, required: true, trim: true }, // nome do admin
    email: { type: String, required: true, trim: true, unique: true }, // email do admin
    senha: { type: String, required: true, trim: true }, // senha do admin
    tipo: { type: String, enum: ['cliente', 'admin'], required: true , default: 'admin' }, // tipo do usuário
    tarefasCompletas: { type: Number, default: 0, min: 0 }, // número de tarefas completas
    tarefasConcluidas: [{ type: String }], // array de IDs das tarefas concluídas
    // Permissões específicas para o admin
    permissoes: { 
        type: [String], 
        default: ['criar_pinos', 'editar_pinos', 'deletar_pinos', 'gerenciar_usuarios'] 
    },
    ultimoAcesso: { type: Date, default: Date.now } // data do último acesso do admin
}, {
    timestamps: true // Adiciona automaticamente createdAt e updatedAt
})

// Cria e exporta o modelo Cliente baseado no schema
module.exports = mongoose.model("Admins", adminSchema)