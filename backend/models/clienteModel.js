const mongoose = require("mongoose")
const Schema = mongoose.Schema

// esquema dos clientes
const clienteSchema = new Schema({
    nome: { type: String, requiered: true }, // nome do cliente
    email: { type: String, requiered: true }, // email do cliente
    capibas: { type:Number, requiered: true, default: 0 }, // cliente sempre começa com 0 capibas
    nivelDeAcesso: { type: Number, requiered: true, default: 0 } // usuarios vão ter o nivel de acesso 0 por padrão
})

module.exports = mongoose.model("clientes", clienteSchema)