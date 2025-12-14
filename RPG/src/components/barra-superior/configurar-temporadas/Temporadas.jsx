import { useEffect, useState } from "react";
import "../../../css/temporadas.css";
import axios from "axios";

export default function Temporadas() {
  const [temporadas, setTemporadas] = useState([]);
  const [pinos, setPinos] = useState([]);
  const [form, setForm] = useState({
    titulo: "",
    dataInicio: "",
    dataFim: "",
    status: "agendado",
    pinIds: []
  });

  // Carregar temporadas e pinos
  useEffect(() => {
    carregarTemporadas();
    carregarPinos();
  }, []);

  const carregarTemporadas = async () => {
    try {
      const res = await axios.get("/api/temporadas", {
        headers: { "x-user-id": "admin123", "x-user-tipo": "admin" }
      });
      setTemporadas(res.data);
    } catch (err) {
      console.error("Erro ao carregar temporadas", err);
    }
  };

  const carregarPinos = async () => {
    try {
      const res = await axios.get("/api/pinos", {
        headers: { "x-user-id": "admin123", "x-user-tipo": "admin" }
      });
      setPinos(res.data);
    } catch (err) {
      console.error("Erro ao carregar pinos", err);
    }
  };

  const criarTemporada = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/temporadas", form, {
        headers: { "x-user-id": "admin123", "x-user-tipo": "admin" }
      });
      setForm({ titulo: "", dataInicio: "", dataFim: "", status: "agendado", pinIds: [] });
      carregarTemporadas();
    } catch (err) {
      console.error("Erro ao criar temporada", err);
    }
  };

  const atualizarTemporada = async (id, dados) => {
    try {
      await axios.patch(`/api/temporadas/${id}`, dados, {
        headers: { "x-user-id": "admin123", "x-user-tipo": "admin" }
      });
      carregarTemporadas();
    } catch (err) {
      console.error("Erro ao atualizar temporada", err);
    }
  };

  const deletarTemporada = async (id) => {
    console.log("deletando");
    try {
      await axios.delete(`/api/temporadas/${id}`, {
        headers: { "x-user-id": "admin123", "x-user-tipo": "admin" }
      });
      carregarTemporadas();
    } catch (err) {
      console.error("Erro ao deletar temporada", err);
    }
  };

  return (
    <div className="temporadas-content">
      <h2>Configurar Temporada</h2>

      {/* Formulário de criação */}
      <form onSubmit={criarTemporada}>
        <input
          type="text"
          placeholder="Título"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.dataInicio}
          onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.dataFim}
          onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
          required
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="agendado">Agendado</option>
          <option value="ativo">Ativo</option>
          <option value="encerrado">Encerrado</option>
        </select>

        {/* Multi-select de pinos */}
        <select
          multiple
          value={form.pinIds}
          onChange={(e) =>
            setForm({
              ...form,
              pinIds: Array.from(e.target.selectedOptions, (opt) => opt.value)
            })
          }
        >
          {pinos.map((p) => (
            <option key={p._id} value={p._id}>
              {p.nome}
            </option>
          ))}
        </select>

        <button type="submit">Criar Temporada</button>
      </form>

      {/* Lista de temporadas */}
      <h3>Temporadas existentes</h3>
      <ul>
        {temporadas.map((t) => (
          <li key={t._id}>
            <strong>{t.titulo}</strong> ({t.status})  
            <br />
            {new Date(t.dataInicio).toLocaleDateString()} -{" "}
            {new Date(t.dataFim).toLocaleDateString()}
            <br />
            Pinos: {t.pinIds?.length}
            <br />
            <button onClick={() => atualizarTemporada(t._id, { status: "encerrado" })}>
              Encerrar
            </button>
            <button onClick={() => deletarTemporada(t._id)}>Deletar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
