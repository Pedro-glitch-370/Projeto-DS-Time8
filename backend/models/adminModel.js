const mongoose = require("mongoose")
const Schema = mongoose.Schema

// esquema dos admins
const adminSchema = new Schema({
    nome: { type: String, requiered: true }, // nome do admin
    email: { type: String, requiered: true }, // email do admin
    nivelDeAcesso: { type: Number, requiered: true, default: 1 } // admins vão ter o nivel de acesso 1 por padrão
})

module.exports = mongoose.model("admin", adminSchema)