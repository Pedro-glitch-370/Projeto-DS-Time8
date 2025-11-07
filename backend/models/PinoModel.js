const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*
se quiser usar o auto-increment pro ID, use isso:

npm install mongoose-sequence

// Adicione o plugin de auto-increment
const AutoIncrement = require('mongoose-sequence')(mongoose)

id: { type: Number },

PinoSchema.plugin(AutoIncrement, { 
    inc_field: 'id',
    id: 'pino_seq'
})
*/

// Json Schema que define a estrutura de um pinos no MongoDB
const PinoSchema = new Schema({

    // nome do pino
    nome: { type: String, required: true },

    // localização do pino (longitude e latitude)
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

    // mensagem que vai ter no pino
    msg: { type: String, required: true},

    // Data de criação do pino, sempre salva o a data atual
    createdAt: {
    type: Date,
    default: Date.now
    }
})

// Índice para buscas geográficas
PinoSchema.index({ localizacao: '2dsphere' })

// Exporta o modelo Pino baseado no PinoSchema
module.exports = mongoose.model('pinos', PinoSchema)