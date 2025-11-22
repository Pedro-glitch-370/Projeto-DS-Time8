import { useState, useCallback } from 'react';
import { pinoService } from '../../services/pinoService.js';
import { authService } from '../../services/authService.js';

const usePinosManagement = () => {
  const [pinos, setPinos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar pinos
  const fetchPinos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pinosData = await pinoService.getPinos();
      setPinos(pinosData);
    } catch (err) {
      setError(err.message || 'Erro ao carregar pinos');
      console.error('Erro ao buscar pinos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar pino
  const addPino = useCallback((novoPino) => {
    setPinos(prev => [...prev, novoPino]);
  }, []);

  // Remover pino
  const removePino = useCallback((pinoId) => {
    setPinos(prev => prev.filter(pino => pino._id !== pinoId));
  }, []);

  // ATUALIZAR PINO - COM LOGS DETALHADOS
  const updatePino = useCallback(async (pinoId, dadosAtualizados) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 usePinosManagement: Iniciando atualização');
      console.log('📦 pinoId:', pinoId);
      console.log('📦 dadosAtualizados:', dadosAtualizados);
      
      const pinoAtualizado = await pinoService.updatePino(pinoId, dadosAtualizados);
      
      console.log('✅ usePinosManagement: Pino atualizado com sucesso:', pinoAtualizado);
      
      // Atualiza o pino na lista local
      setPinos(prev => prev.map(pino => 
        pino._id === pinoId ? pinoAtualizado : pino
      ));
      
      return pinoAtualizado;
    } catch (err) {
      const errorMsg = err.message || 'Erro ao atualizar pino';
      console.error('❌ usePinosManagement: Erro ao atualizar:', err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pinos,
    loading,
    error,
    fetchPinos,
    addPino,
    removePino,
    updatePino,
    isAdmin: authService.isAdmin,
    getUser: authService.getUser
  };
};

export default usePinosManagement;