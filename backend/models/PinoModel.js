const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PinoSchema = new Schema({
    id: { type: Number, required: true},
    nome: { type: String, required: true},
    localizacao: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    msg: { type: String, required: true},
    createdAt: {
    type: Date,
    default: Date.now
    }
})

// Índice para buscas geográficas
PinoSchema.index({ localizacao: '2dsphere' })

module.exports = mongoose.model('pinos', PinoSchema)