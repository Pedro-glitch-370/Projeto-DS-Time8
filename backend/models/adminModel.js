const mongoose = require("mongoose")
const Schema = mongoose.Schema

const adminSchema = new Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tipo: { type: String, enum: ['cliente', 'admin'], required: true },
    tarefasConcluidas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pino' 
    }],
    permissoes: { 
        type: [String], 
        default: ['criar_pinos', 'editar_pinos', 'deletar_pinos', 'gerenciar_usuarios'] 
    },
    ultimoAcesso: { type: Date, default: Date.now }
}, {
    timestamps: true
})

module.exports = mongoose.model("Admin", adminSchema)