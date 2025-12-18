import { useState, useEffect } from "react";
import { temporadaService } from "../../services/temporadaService";
import { pinoService } from "../../services/pinoService";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import "./Temporadas.css";

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

  useEffect(() => {
  if (mensagem) {
    const timer = setTimeout(() => {
      setMensagem("");
    }, 5000);

    return () => clearTimeout(timer);
  }
}, [mensagem]);


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

    const erros = await temporadaService.validarTemporada(novaTemporada);
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

      // Atualiza a temporada atual
      const atual = temporadasData.find(t => t.status === "ativo");
      setTemporadaAtual(atual || null);

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

  const handleAtivar = async (id) => {
    try {
      // Desativa a temporada atual
      if (temporadaAtual) {
        await temporadaService.atualizarTemporada(temporadaAtual._id, { status: "agendado" });
      }

      // Ativa a temporada escolhida
      await temporadaService.atualizarTemporada(id, { status: "ativo" });

      // Atualiza lista e estado
      const temporadasData = await temporadaService.getTemporadas();
      setTemporadas(temporadasData);

      const atual = temporadasData.find(t => t.status === "ativo");
      setTemporadaAtual(atual || null);

      setMensagem("✅ Temporada ativada com sucesso!");
    } catch (error) {
      setMensagem("❌ Erro ao ativar temporada: " + (error.message || ""));
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
    <div className="temporadas-container">
      <div className="header-temporadas">
        <h2>Configurar Temporadas</h2>
      </div>
      
      <form onSubmit={handleCriarTemporada}>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="agendado">Agendado</option>
          <option value="ativo">Ativo</option>
        </select>
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

      {mensagem &&
        <p className={`mensagem ${mensagem.startsWith("✅") ? "sucesso" : "erro"}`}>
          {mensagem}
        </p>}

      <div className="temporadas-existentes">
        <h3>Temporada Atual</h3>
        {temporadaAtual ? (
          <div className="temporada-item">
            <h1><strong>{temporadaAtual.titulo}</strong></h1>
            <p>
              {new Date(temporadaAtual.dataInicio).toLocaleDateString("pt-BR")} -{" "}
              {new Date(temporadaAtual.dataFim).toLocaleDateString("pt-BR")}
            </p>
            <p>Status: {temporadaAtual.status}</p>
            {temporadaAtual.pinIds && temporadaAtual.pinIds.length > 0 && (
              <div className="pinos-lista">
                <p>Pinos:</p>
                <ul>
                  {temporadaAtual.pinIds.map((pino) => (
                    <li key={pino._id}>{pino.nome || pino._id} {console.log(pino)}</li>
                  ))}
                </ul>
              </div>
            )}
            <button className="btn-deletar-temp" onClick={() => handleDeletar(temporadaAtual._id)}>Deletar</button>
          </div>
        ) : (
          <p>Nenhuma temporada ativa</p>
        )}

        <h3>Temporadas Existentes</h3>
        {temporadas.length === 0 ? (
          <p>Nenhuma temporada existente</p>
        ) : (temporadas.map((t) => (
          <div key={t._id} className="temporada-item">
            <h1><strong>{t.titulo}</strong></h1>
            <p>
              {new Date(t.dataInicio).toLocaleDateString("pt-BR")} -{" "}
              {new Date(t.dataFim).toLocaleDateString("pt-BR")}
            </p>
            <p>Status: {t.status}</p>
            {t.pinIds && t.pinIds.length > 0 && (
              <div className="pinos-lista">
                <p>Pinos:</p>
                <ul>
                  {t.pinIds.map((pino) => (
                    <li key={pino._id}>{pino.nome || pino._id} {console.log(pino)}</li>
                  ))}
                </ul>
              </div>
            )}

            {t.status !== "ativo" ? (
                <>
                  <button className="btn-ativar-temp" onClick={() => handleAtivar(t._id)}>Ativar</button>
                  <button className="btn-deletar-temp" onClick={() => handleDeletar(t._id)}>Deletar</button>
                </>
              ) : (
                <button className="btn-deletar-temp" onClick={() => handleDeletar(t._id)}>Deletar</button>
              )}
          </div>
        )))}
      </div>
      
    </div>
  );
}
