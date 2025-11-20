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

  // Atualizar pino
  const updatePino = useCallback((pinoId, pinoAtualizado) => {
    setPinos(prev => prev.map(pino => 
      pino._id === pinoId ? pinoAtualizado : pino
    ));
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