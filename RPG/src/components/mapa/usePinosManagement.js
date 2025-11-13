import { useState, useCallback } from "react";
import api from "../../services/api";

// Hook (função que intercepta eventos) pra gerenciar pinos
export default function usePinosManagement() {
  const [pinos, setPinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função pra buscar os pinos da API
  const fetchPinos = useCallback(async () => {
    try {
      console.log("🔄 Buscando pinos...");
      setLoading(true);
      setError(null);

      // Faz a requisição para a API do backend
      const response = await api.get("/pinos");
      console.log("✅ Pinos carregados:", response.data);

      const pinosValidos = response.data.filter(
        (pino) => pino.localizacao?.coordinates?.length === 2
      );

      if (pinosValidos.length !== response.data.length) {
        console.warn("⚠️ Alguns pinos foram filtrados por dados inválidos");
      }

      // Atualiza o estado com os pinos recebidos
      setPinos(pinosValidos);
    } catch (err) {
      // Se a requisição falhar
      console.error("❌ Erro ao buscar pinos:", err);
      setError(err.message);

      // Pino de fallback (quando o backend não tá disponível)
      const fallbackPinos = [
        {
          _id: "fallback-99",
          localizacao: { coordinates: [-8.0696, -34.888016] },
          msg: "Pintar e Renovar Quadra Campo dos Coelhos",
          nome: "Quadra Campo dos Coelhos (Offline)",
        },
      ];

      setPinos(fallbackPinos);
    } finally {
      // Sempre acontece, é pra finaliza o estado de carregamento
      setLoading(false);
    }
  }, []); // Só será executada uma única vez por causa do []

  const addPino = useCallback((newPino) => {
    setPinos((prev) => [...prev, newPino]);
  }, []);

  const removePino = useCallback((pinoId) => {
    setPinos((prev) =>
      prev.filter((pino) => pino._id !== pinoId && pino.id !== pinoId)
    );
  }, []);

  return {
    pinos,
    loading,
    error,
    fetchPinos,
    addPino,
    removePino,
  };
}
