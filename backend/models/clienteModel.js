const mongoose = require("mongoose")
const Schema = mongoose.Schema

// esquema dos clientes
const clienteSchema = new Schema({
    nome: { type: String, required: true }, // nome do cliente
    email: { type: String, required: true }, // email do cliente
    tipo: { type: String, enum: ['cliente', 'admin'], required: true },
    capibas: { type:Number, required: true, default: 0 }, // cliente sempre começa com 0 capibas
    tarefasCompletas: { type: Number, default: 0 },
    tarefasConcluidas: [{ type: String }],
    ultimaAtividade: { type: Date, default: Date.now }
}, {
    timestamps: true
})

module.exports = mongoose.model("clientes", clienteSchema)