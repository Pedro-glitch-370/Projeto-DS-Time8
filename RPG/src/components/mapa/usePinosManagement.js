import { useState, useCallback } from 'react';
import { pinoService } from '../../services/pinoService.js';
import { authService } from '../../services/authService.js';

// Funções auxiliares
const logOperacao = (operacao, dados) => {
  console.log(`🔄 ${operacao}:`, dados);
};

const logSucesso = (operacao, resultado) => {
  console.log(`✅ ${operacao} com sucesso:`, resultado);
};

const logErro = (operacao, erro) => {
  console.error(`❌ Erro ao ${operacao}:`, erro);
};

const usePinosManagement = () => {
  const [pinos, setPinos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado de loading e erro
  const iniciarCarregamento = () => {
    setLoading(true);
    setError(null);
  };

  const finalizarCarregamento = () => {
    setLoading(false);
  };

  const definirErro = (mensagem) => {
    setError(mensagem);
  };

  // Operações CRUD
  const fetchPinos = useCallback(async () => {
    iniciarCarregamento();
    
    try {
      const pinosData = await pinoService.getPinos();
      setPinos(pinosData);
      logSucesso('buscar pinos', `${pinosData.length} pinos carregados`);
    } catch (err) {
      const errorMsg = err.message || 'Erro ao carregar pinos';
      definirErro(errorMsg);
      logErro('buscar pinos', err);
    } finally {
      finalizarCarregamento();
    }
  }, []);

  const addPino = useCallback((novoPino) => {
    setPinos(prev => [...prev, novoPino]);
    logOperacao('adicionar pino local', novoPino.nome);
  }, []);

  const removePino = useCallback((pinoId) => {
    setPinos(prev => prev.filter(pino => pino._id !== pinoId));
    logOperacao('remover pino local', pinoId);
  }, []);

  const updatePino = useCallback(async (pinoId, dadosAtualizados) => {
    iniciarCarregamento();
    
    try {
      logOperacao('atualizar pino', { pinoId, dadosAtualizados });
      
      const pinoAtualizado = await pinoService.atualizarPino(pinoId, dadosAtualizados);
      
      setPinos(prev => prev.map(pino => 
        pino._id === pinoId ? pinoAtualizado : pino
      ));
      
      logSucesso('atualizar pino', pinoAtualizado.nome);
      return pinoAtualizado;
      
    } catch (err) {
      const errorMsg = err.message || 'Erro ao atualizar pino';
      definirErro(errorMsg);
      logErro('atualizar pino', err);
      throw err;
    } finally {
      finalizarCarregamento();
    }
  }, []);

  return {
    // Estado
    pinos,
    loading,
    error,
    
    // Operações
    fetchPinos,
    addPino,
    removePino,
    updatePino,
    
    // Auth helpers
    isAdmin: authService.isAdmin,
    getUser: authService.getUser
  };
};

export default usePinosManagement;