const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Json Schema que define a estrutura de um pino no MongoDB
const PinoSchema = new Schema({

  nome: { type: String, required: true, trim: true }, // nome do pino

  // localização do pino (longitude e latitude) - GeoJSON
  localizacao: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },

  msg: { type: String, required: true, trim: true }, // mensagem que vai ter no pino
  capibas: { type: Number, required: true, default: 0, min: 0 }, // capibas iniciais do pino
  
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Admins", // Nome exato que você usou no module.exports do adminModel.js
  },

  // O pino pertence a um grupo? (Opcional)
  grupo: {
    type: Schema.Types.ObjectId,
    ref: "Grupo" // Nome exato que você usou no module.exports do grupoModel.js
  },

  // Data de criação do pino
  createdAt: { type: Date, default: Date.now }

});

// Índice para buscas geográficas (Essencial para o buscarPinosPorProximidade funcionar)
PinoSchema.index({ localizacao: "2dsphere" });

// Exporta o modelo Pino baseado no Schema
module.exports = mongoose.model("pinos", PinoSchema);