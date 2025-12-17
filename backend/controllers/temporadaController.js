const Temporada = require("../models/temporadaModel");

class TemporadaController {
  // Logs
  static _logOperacao(operacao, dados) {
    console.log(`🔍 ${operacao}:`, dados);
  }

  static _logSucesso(operacao, resultado) {
    console.log(`✅ ${operacao} com sucesso:`, resultado);
  }

  static _logErro(operacao, erro) {
    console.error(`❌ Erro ao ${operacao}:`, erro);
  }

  // Criar uma temporada
  static async criarTemporada(req, res) {
    try {
      TemporadaController._logOperacao("criar temporada", req.body);

      const { titulo, dataInicio, status, dataFim, pinIds = [], criadoPor } = req.body;

      if (!titulo || !dataInicio || !dataFim) {
        return res.status(400).json({ message: "Título, dataInicio e dataFim são obrigatórios" });
      }

      const temporada = new Temporada({
        titulo,
        dataInicio,
        dataFim,
        status,
        pinIds,
        criadoPor: criadoPor
      });

      const salva = await temporada.save();

      TemporadaController._logSucesso("criar temporada", { id: salva._id, titulo: salva.titulo, status: salva.status });

      res.status(201).json({
        message: "Temporada criada com sucesso",
        temporada: salva
      });
    } catch (err) {
      TemporadaController._logErro("criar temporada", err);
      res.status(500).json({ message: "Erro interno ao criar temporada" });
    }
  }

  // Listar as temporadas
  static async listarTemporadas(req, res) {
    try {
      const temporadas = await Temporada.find()
      .sort({ dataInicio: -1 })
      .populate("pinIds");
      
      TemporadaController._logSucesso("listar temporadas", `${temporadas.length} encontradas`);
      res.json(temporadas);
    } catch (err) {
      TemporadaController._logErro("listar temporadas", err);
      res.status(500).json({ message: "Erro interno ao listar temporadas" });
    }
  }

  // Pegar a temporada atual
  static async temporadaAtual(req, res) {
    try {
      const agora = new Date();
      const temporada =
        (await Temporada.findOne({ status: "ativo" }).sort({ dataInicio: -1 })) ||
        (await Temporada.findOne({
          dataInicio: { $lte: agora },
          dataFim: { $gte: agora }
        }).sort({ dataInicio: -1 }));

      if (!temporada) {
        return res.json({ message: "Nenhuma temporada ativa", temporada: null });
      }

      TemporadaController._logSucesso("temporada atual", { id: temporada._id, titulo: temporada.titulo });

      res.json(temporada);
    } catch (err) {
      TemporadaController._logErro("temporada atual", err);
      res.status(500).json({ message: "Erro interno ao buscar temporada atual" });
    }
  }

  // Deletar uma temporada
  static async deletarTemporada(req, res) {
    try {
      const { id } = req.params;

      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const temporada = await Temporada.findByIdAndDelete(id);

      if (!temporada) {
        return res.status(404).json({ message: "Temporada não encontrada" });
      }

      res.json({ message: "Temporada deletada com sucesso", id });
    } catch (err) {
      console.error("❌ Erro ao deletar temporada:", err);
      res.status(500).json({ message: "Erro interno ao deletar temporada" });
    }
  }

  // Atualizar temporada
  static async atualizarTemporada(req, res) {
    try {
      const { id } = req.params;
      const dadosAtualizados = req.body;

      // Atualiza apenas os campos enviados
      const temporada = await Temporada.findByIdAndUpdate(
        id,
        { $set: dadosAtualizados },
        { new: true, runValidators: true }
      );

      if (!temporada) {
        return res.status(404).json({ error: "Temporada não encontrada" });
      }

      res.json(temporada);
    } catch (error) {
      console.error("❌ Erro ao atualizar temporada:", error);
      res.status(500).json({ error: "Erro interno ao atualizar temporada" });
    }
  }

}

module.exports = TemporadaController;
