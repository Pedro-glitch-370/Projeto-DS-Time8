import { useState, useEffect } from "react";
import { temporadaService } from "../../services/temporadaService";
import { pinoService } from "../../services/pinoService";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function Temporadas() {
  const [titulo, setTitulo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [status, setStatus] = useState("agendado");
  const [pinIds, setPinIds] = useState([]);
  const [pinos, setPinos] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaAtual, setTemporadaAtual] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const navigate = useNavigate();

  // Carregar pinos e temporadas ao montar
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      // Redireciona se não estiver logado
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.tipo !== "admin") {
        setMensagem("Acesso negado. Apenas administradores podem acessar este painel.");
        setTimeout(() => navigate("/"), 3000);
        return;
    }

    const carregarDados = async () => {
      try {
        const pinosData = await pinoService.getPinos();
        setPinos(pinosData);

        const temporadasData = await temporadaService.getTemporadas();
        setTemporadas(temporadasData);

        // Buscar temporada atual
        const atual = temporadasData.find(t => t.status === "ativo");
        setTemporadaAtual(atual || null);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    carregarDados();
  }, [navigate]);

  // Criar temporada
  const handleCriarTemporada = async (e) => {
    e.preventDefault();

    const userData = authService.getUser();
    const adminId = userData?.id;

    const novaTemporada = {
      titulo,
      dataInicio,
      dataFim,
      status,
      pinIds,
      criadoPor: adminId
    };

    const erros = temporadaService.validarTemporada(novaTemporada);
    if (erros.length > 0) {
      setMensagem(erros.join(" | "));
      return;
    }

    try {
      const dadosAPI = temporadaService.formatarDadosParaAPI(novaTemporada);
      await temporadaService.criarTemporada(dadosAPI);
      setMensagem("✅ Temporada criada com sucesso!");

      // Atualiza lista
      const temporadasData = await temporadaService.getTemporadas();
      setTemporadas(temporadasData);

      // Limpa formulário
      setTitulo("");
      setDataInicio("");
      setDataFim("");
      setStatus("agendado");
      setPinIds([]);
    } catch (error) {
      setMensagem("❌ Erro ao criar temporada: ", error);
    }
  };

  // Deletar temporada
  const handleDeletar = async (id) => {
    try {
      await temporadaService.deletarTemporada(id);
      setMensagem("✅ Temporada deletada com sucesso!");
      const temporadasData = await temporadaService.getTemporadas();
      setTemporadas(temporadasData);
    } catch (error) {
      setMensagem("❌ Erro ao deletar temporada: ", error);
    }
  };

  // Seleção de pinos
  const togglePino = (id) => {
    setPinIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h2>Criar Temporada</h2>
      <form onSubmit={handleCriarTemporada}>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="agendado">Agendado</option>
          <option value="ativo">Ativo</option>
        </select>

        <h4>Selecionar Pinos</h4>
        {pinos.map((pino) => (
          <label key={pino._id}>
            <input
              type="checkbox"
              checked={pinIds.includes(pino._id)}
              onChange={() => togglePino(pino._id)}
            />
            {pino.nome || pino._id}
          </label>
        ))}

        <button type="submit">Criar Temporada</button>
      </form>

      {mensagem && <p>{mensagem}</p>}

      <h3>Temporada Atual</h3>
      {temporadaAtual ? (
        <div>
          <p>{temporadaAtual.titulo}</p>
          <p>
            {new Date(temporadaAtual.dataInicio).toLocaleDateString("pt-BR")} -{" "}
            {new Date(temporadaAtual.dataFim).toLocaleDateString("pt-BR")}
          </p>
          <p>Status: {temporadaAtual.status}</p>
        </div>
      ) : (
        <p>Nenhuma temporada ativa</p>
      )}

      <h3>Temporadas Existentes</h3>
      {temporadas.map((t) => (
        <div key={t._id}>
          <p>{t.titulo}</p>
          <p>
            {new Date(t.dataInicio).toLocaleDateString("pt-BR")} -{" "}
            {new Date(t.dataFim).toLocaleDateString("pt-BR")}
          </p>
          <p>Status: {t.status}</p>
          <button onClick={() => handleDeletar(t._id)}>Deletar</button>
        </div>
      ))}
    </div>
  );
}
