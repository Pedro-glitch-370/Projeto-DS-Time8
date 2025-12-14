const mongoose = require("mongoose")
const Schema = mongoose.Schema

const SolicitacaoSchema = new Schema({
  nome: { 
    type: String, 
    required: true, 
    trim: true 
  },
  msg: { 
    type: String, 
    required: true, 
    trim: true 
  },
  capibas: { 
    type: Number, 
    required: true, 
    default: 0, 
    min: 0 
  },
  status: {
    type: String,
    enum: ['pendente', 'aprovada', 'rejeitada'],
    default: 'pendente'
  },
  enviadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'cliente',
      required: true
  },
  aprovadoPor: {
    type: String,
    default: null
  },
  motivoRejeicao: {
    type: String,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
})

// Middleware para atualizar updatedAt antes de salvar
SolicitacaoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Solicitacao", SolicitacaoSchema)