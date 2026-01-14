import { useState, useEffect } from "react";
import { temporadaService } from "../../services/temporadaService";
import { pinoService } from "../../services/pinoService";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import Particulas from "../particulas/Particulas";
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
  const [boolDelete, setBoolDelete] = useState(false);
  const [temporadaToDelete, setTemporadaToDelete] = useState(null);
  const [ativa, setAtiva] = useState(null);
  const toggleTarefa = (id) => {
    setAtiva(ativa === id ? null : id);
  };
  const [atualAtiva, setAtualAtiva] = useState(null);
  const toggleAtual = () => setAtualAtiva(!atualAtiva);

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

  // Abrir modal de confirmação
  const confirmDeletar = (temporada) => {
      setTemporadaToDelete(temporada);
      setBoolDelete(true);
  };

  // Deletar temporada
  const handleDeletar = async () => {
    if (!temporadaToDelete) return;

    try {
      await temporadaService.deletarTemporada(temporadaToDelete._id);
      setMensagem("✅ Temporada deletada com sucesso!");
      const temporadasData = await temporadaService.getTemporadas();
      setTemporadas(temporadasData);
    } catch (err) {
      setMensagem("❌ Erro ao deletar temporada: ", err);
    } finally {
      setTemporadaToDelete(null);
      setBoolDelete(false);
    }
  };

  // Fechar modal de confirmação
  const closeModal = () => {
      setTemporadaToDelete(null);
      setBoolDelete(false);
  };

  // Seleção de pinos
  const togglePino = (id) => {
    setPinIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="temporadas-container">
      <section className="conteudo-temporadas">
        <header className="header-temporadas">
          <h1>Configurar Temporadas</h1>
          <p className="user-welcome-gerenciar">Preencha os campos abaixo para criar uma temporada</p>
        </header>
        
        <form onSubmit={handleCriarTemporada}>
          <h4>Informações Gerais (obrigatório)</h4>
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

          <h4>Selecionar Pinos (opcional)</h4>
          {pinos.map((pino) => {
            // Verifica se esse pino já tá em outra temporada
            const jaUsado = temporadas.some(t => 
              t.pinIds?.some(id => {
                // pinIds pode vir como array de objetos ou de strings
                return (typeof id === "string" ? id : id._id) === pino._id;
              })
            );

            return (
              <label key={pino._id}>
                <input
                  type="checkbox"
                  checked={pinIds.includes(pino._id)}
                  onChange={() => togglePino(pino._id)}
                  disabled={jaUsado}
                />
                {pino.nome || pino._id}
                {jaUsado && <span>*já em temporada</span>}
              </label>
            );
          })}

          <button type="submit">Criar Temporada</button>
        </form>
        {mensagem &&
        <p className={`mensagem ${mensagem.startsWith("✅") ? "sucesso" : "erro"}`}>
          {mensagem}
        </p>
        }
      </section>

      <section className="conteudo-temporadas">
        <header className="header-temporadas">
          <h1>Lista de Temporadas</h1>
        </header>

        <div className="temporadas-existentes">
          <h4>Temporada Atual</h4>
          {temporadaAtual ? (
            <div className={`temporada-item ${atualAtiva ? "ativa" : ""}`}>
              <div className="header-lista-temporadas">
                <h1 onClick={(e) => {
                  e.stopPropagation();
                  toggleAtual();
                }}>
                  <strong>{temporadaAtual.titulo}</strong>
                </h1>
                <button className="btn-deletar-temp" onClick={() => confirmDeletar(temporadaAtual)}>Deletar</button>
              </div>
              <div className="conteudo-temporada">
                <p>
                  {new Date(temporadaAtual.dataInicio).toLocaleDateString("pt-BR")} -{" "}
                  {new Date(temporadaAtual.dataFim).toLocaleDateString("pt-BR")}
                </p>
                <p>Status: {temporadaAtual.status}</p>
                {temporadaAtual.pinIds && (
                  <div className="pinos-lista">
                    {temporadaAtual.pinIds.length > 0 ? (
                      <>
                        <p>Pinos:</p>
                        <ul>
                          {temporadaAtual.pinIds.map((pino) => (
                            <li key={pino._id}>{pino.nome || pino._id}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p><strong>Sem pinos de tarefa</strong></p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="temporada-item" id="sem-temporada-ativa">Nenhuma temporada ativa</p>
          )}

          <h4>Temporadas Existentes</h4>
          {temporadas.length === 0 ? (
            <p>Nenhuma temporada existente</p>
          ) : (temporadas.map((t) => (
            <div key={t._id} className={`temporada-item ${ativa === t._id ? "ativa" : ""}`}>
              <div className="header-lista-temporadas">
                <h1 onClick={(e) => {
                      e.stopPropagation();
                      toggleTarefa(t._id);
                    }}
                >
                    <strong>{t.titulo}</strong>
                </h1>
                <div>
                  {t.status !== "ativo" ? (
                    <>
                      <button className="btn-ativar-temp" onClick={() => handleAtivar(t._id)}>Ativar</button>
                      <button className="btn-deletar-temp" onClick={() => confirmDeletar(t)}>Deletar</button>
                    </>
                  ) : (
                    <button className="btn-deletar-temp" onClick={() => confirmDeletar(t)}>Deletar</button>
                  )}
                </div>
              </div>
              <div className="conteudo-temporada">
                <p>
                  {new Date(t.dataInicio).toLocaleDateString("pt-BR")} -{" "}
                  {new Date(t.dataFim).toLocaleDateString("pt-BR")}
                </p>
                <p>Status: {t.status}</p>
                {t.pinIds && (
                  <div className="pinos-lista">
                    {t.pinIds.length > 0 ? (
                      <>
                        <p>Pinos:</p>
                        <ul>
                          {t.pinIds.map((pino) => (
                            <li key={pino._id}>{pino.nome || pino._id}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p><strong>Sem pinos de tarefa</strong></p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )))}
          {mensagem &&
          <p className={`mensagem ${mensagem.startsWith("✅") ? "sucesso" : "erro"}`}>
            {mensagem}
          </p>
          }
        </div>
      </section>

      {boolDelete && (
        <div className="modal-temporadas">
            <section className="modal-content">
                <h3>⚠️ Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir "{temporadaToDelete.titulo}"?<br></br>Esta ação não pode ser desfeita.</p>
                <section className="modal-buttons">
                    <button className="confirm-btn" onClick={handleDeletar}>Excluir</button>
                    <button className="cancel-btn" onClick={closeModal}>Cancelar</button>
                </section>
            </section>
        </div>        
      )}
      <Particulas />
    </div>
  );
}
