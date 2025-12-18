const mongoose = require("mongoose");
const Schema = mongoose.Schema

// esquema das temporadas
const temporadaSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date, required: true },
    status: {
      type: String,
      enum: ["agendado", "ativo", "encerrado"],
      default: "agendado"
    },
    pinIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "pinos", default: [] }],
    criadoPor: { type: String, required: true }
  },
  { timestamps: true }
);

// Obrigar a data de início ser menor que a data de término
temporadaSchema.pre("save", function (next) {
  if (this.dataInicio >= this.dataFim) {
    return next(new Error("dataInicio deve ser anterior a dataFim"));
  }
  next();
});

module.exports = mongoose.model("temporada", temporadaSchema);
