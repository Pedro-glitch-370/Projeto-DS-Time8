const mongoose = require("mongoose")
const Schema = mongoose.Schema

// esquema dos clientes
const clienteSchema = new Schema({
    nome: { type: String, required: true , trim: true }, // nome do cliente
    email: { type: String, required: true , trim: true }, // email do cliente
    senha: { type: String, required: true, trim: true }, // senha do cliente
    tipo: { type: String, enum: ['cliente', 'admin'], required: true , default: 'cliente' }, // tipo do cliente
    capibas: { type:Number, required: true, default: 0 , min: 0}, // cliente sempre começa com 0 capibas
    tarefasCompletas: { type: Number, default: 0 , min: 0}, // número de tarefas completas
    tarefasConcluidas: [{ type: String, unique: true }], // array de IDs das tarefas concluídas
    ultimaAtividade: { type: Date, default: Date.now } // data da última atividade do cliente
}, {
    timestamps: true // adiciona automaticamente createdAt e updatedAt
})

// Índice para melhor performance nas buscas
clienteSchema.index({ email: 1 });
clienteSchema.index({ 'tarefasConcluidas': 1 });

// Cria e exporta o modelo Cliente baseado no schema
module.exports = mongoose.model("clientes", clienteSchema)