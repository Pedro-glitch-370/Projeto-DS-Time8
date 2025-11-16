const mongoose = require("mongoose")
const Schema = mongoose.Schema

const adminSchema = new Schema({
    nome: { 
        type: String, 
        required: true // ✅ CORRETO
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    registroDePinos: { 
        type: Number, 
        default: 0
    },
    nivelDeAcesso: { 
        type: Number, 
        required: true, 
        default: 1 
    }
})

module.exports = mongoose.model("admin", adminSchema)