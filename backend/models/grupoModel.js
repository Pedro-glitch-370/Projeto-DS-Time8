const mongoose = require('mongoose');

const GrupoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    
    codigo: {
        type: String,
        required: true,
        unique: true,
        uppercase: true // Força letras maiúsculas para facilitar
    },
    
    descricao: {
        type: String,
        default: "Um grupo de aventureiros do Recife Point Game"
    },
    
    lider: { // O dono do grupo (quem pode remover membros)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    
    membros: [{ // Lista de até 5 membros
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente'
    }],
    
    pontuacaoTotal: { // A "Carteira do Grupo" que será dividida no final do mês
        type: Number,
        default: 0
    },

    /* controle de pagamento mensal */
    dataProximoPagamento: {
        type: Date,
        // Define automaticamente para 30 dias a partir do momento de criação
        default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000)
    },
    
    dataCriacao: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Grupo', GrupoSchema);