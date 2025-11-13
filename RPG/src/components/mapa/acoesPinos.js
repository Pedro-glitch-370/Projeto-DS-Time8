import api from "../../services/api";

// Função pra salvar o pino
export async function handleSavePino({
  dados,
  addPino,
  setIsSidebarOpen,
  setTempPin,
  setSelectedPino,
}) {
  console.log("💾 Salvando pino:", dados);

  const pinoData = {
    nome: dados.nome,
    msg: dados.msg,
    latitude: dados.coordinates[1],
    longitude: dados.coordinates[0],
  };

  try {
    const response = await api.post("/pinos/adicionar", pinoData);
    console.log("✅ Pino salvo:", response.data);
    if (response.data.localizacao?.coordinates) {
      addPino(response.data);
    }
    setIsSidebarOpen(false);
    setTempPin(null);
    setSelectedPino(null);
    alert("Ponto salvo com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao salvar pino:", error);
    const message_1 =
      error.response?.data?.message ||
      error.response?.data ||
      "Erro de conexão";
    alert(`Erro ao salvar: ${message_1}`);
  }
}

// =================================================================
// Função pra deletar pino
export function handleDeletePino({
  pinoId,
  removePino,
  setIsSidebarOpen,
  setSelectedPino,
}) {
  console.log("🗑️ Deletando pino:", pinoId);

  if (!pinoId) {
    alert("ID do pino não encontrado");
    return;
  }

  const confirmacao = window.confirm(
    "Tem certeza que deseja deletar este pino?"
  );
  if (!confirmacao) return;

  return api
    .delete(`/pinos/deletar/${pinoId}`)
    .then(() => {
      removePino(pinoId);
      setIsSidebarOpen(false);
      setSelectedPino(null);
      alert("Pino deletado com sucesso! ✅");
    })
    .catch((error) => {
      console.error("❌ Erro ao deletar pino:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Erro de conexão";
      alert(`Erro ao deletar: ${message}`);
    });
}

// =================================================================
// Função pra clicar em um pino existente
export function handlePinoClick(pino, setSelectedPino, setIsSidebarOpen) {
  setSelectedPino(pino);
  setIsSidebarOpen(true);
}
