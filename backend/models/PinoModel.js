const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Json Schema que define a estrutura de um pino no MongoDB
const PinoSchema = new Schema({
  // nome do pino
  nome: { type: String, required: true },

  // localização do pino (longitude e latitude)
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

  // mensagem que vai ter no pino
  msg: { type: String, required: true },

  // Data de criação do pino, sempre salva o a data atual
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Índice para buscas geográficas
PinoSchema.index({ localizacao: "2dsphere" })

// Exporta o modelo Pino baseado no PinoSchema
module.exports = mongoose.model("pinos", PinoSchema)