const mongoose = require("mongoose")
const Schema = mongoose.Schema

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
  capibas: { type: Number, required: true, default: 0, min: 0}, // capibas iniciais do pino
  usuario: { type: Schema.Types.ObjectId, ref: "Admins" },
  grupo: { type: Schema.Types.ObjectId, ref: "Grupo" }, // O pino pertence a um grupo? (Opcional)
  createdAt: {type: Date, default: Date.now} // Data de criação do pino, sempre salva o a data atual
})

// Índice para buscas geográficas
PinoSchema.index({ localizacao: "2dsphere" })

// Exporta o modelo Pino baseado no Schema
module.exports = mongoose.model("pinos", PinoSchema)