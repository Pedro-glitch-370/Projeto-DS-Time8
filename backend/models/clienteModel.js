const mongoose = require("mongoose")
const Schema = mongoose.Schema

// esquema dos clientes
const clienteSchema = new Schema({
    nome: { type: String, required: true, trim: true }, // nome do cliente
    email: { type: String, required: true, trim: true, unique: true }, // email do cliente
    senha: { type: String, required: true, trim: true }, // senha do cliente
    tipo: { type: String, enum: ['cliente', 'admin'], required: true , default: 'cliente' }, // tipo do cliente
    
    solicitacoesEnviadas: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Solicitacao' 
    }],

    capibas: { type:Number, required: true, default: 0 , min: 0}, // cliente sempre começa com 0 capibas
    tarefasCompletas: { type: Number, default: 0 , min: 0}, // número de tarefas completas
    tarefasConcluidas: [{ type: String }], // array de IDs das tarefas concluídas
    ultimaAtividade: { type: Date, default: Date.now } // data da última atividade do cliente
}, {
    timestamps: true // adiciona automaticamente createdAt e updatedAt
})

// Cria e exporta o modelo Cliente baseado no schema
module.exports = mongoose.model("clientes", clienteSchema)