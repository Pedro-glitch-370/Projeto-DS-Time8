const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    senha: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        default: 'cliente'
    },
    capibas: {
        type: Number,
        default: 0
    },
    tarefasCompletas: {
        type: Number,
        default: 0
    },
    // Array simples de Strings para guardar IDs das tarefas concluídas
    tarefasConcluidas: [{
        type: String
    }],
    grupo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grupo',
        default: null
    },
    dataCriacao: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Cliente", ClienteSchema);