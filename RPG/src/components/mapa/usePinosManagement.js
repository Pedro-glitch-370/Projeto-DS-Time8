import { useState, useCallback } from 'react';
import { pinoService } from '../../services/pinoService.js';
import { authService } from '../../services/authService.js';

// Funções auxiliares para logging (rastreamento de operações)
const logOperacao = (operacao, dados) => {
  console.log(`🔄 ${operacao}:`, dados);
};

const logSucesso = (operacao, resultado) => {
  console.log(`✅ ${operacao} com sucesso:`, resultado);
};

const logErro = (operacao, erro) => {
  console.error(`❌ Erro ao ${operacao}:`, erro);
};

// Hook customizado para gerenciamento de pinos (posts/marcadores)
const usePinosManagement = () => {
  // Estado principal do hook
  const [pinos, setPinos] = useState([]);        // Lista de pinos
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [error, setError] = useState(null);      // Mensagens de erro

  // ===== FUNÇÕES DE CONTROLE DE ESTADO =====
  
  // Inicia o estado de carregamento e limpa erros anteriores
  const iniciarCarregamento = () => {
    setLoading(true);
    setError(null);
  };

  // Finaliza o estado de carregamento
  const finalizarCarregamento = () => {
    setLoading(false);
  };

  // Define uma mensagem de erro
  const definirErro = (mensagem) => {
    setError(mensagem);
  };

  // ===== OPERAÇÕES CRUD (Create, Read, Update, Delete) =====

  // Busca todos os pinos do servidor
  const fetchPinos = useCallback(async () => {
    iniciarCarregamento();
    
    try {
      // Chama o serviço para buscar pinos da API
      const pinosData = await pinoService.getPinos();
      
      // Atualiza o estado com os dados recebidos
      setPinos(pinosData);
      
      // Log de sucesso
      logSucesso('buscar pinos', `${pinosData.length} pinos carregados`);
      
    } catch (err) {
      // Tratamento de erro
      const errorMsg = err.message || 'Erro ao carregar pinos';
      definirErro(errorMsg);
      logErro('buscar pinos', err);
    } finally {
      // Garante que o loading seja finalizado mesmo em caso de erro
      finalizarCarregamento();
    }
  }, []); // useCallback sem dependências - função estável

  // Adiciona um novo pino LOCALMENTE (sem chamada à API)
  // Útil para otimização UI enquanto aguarda confirmação do servidor
  const addPino = useCallback((novoPino) => {
    // Adiciona o novo pino ao final da lista
    setPinos(prev => [...prev, novoPino]);
    logOperacao('adicionar pino local', novoPino.nome);
  }, []);

  // Remove um pino LOCALMENTE pelo ID
  const removePino = useCallback((pinoId) => {
    // Filtra a lista removendo o pino com o ID especificado
    setPinos(prev => prev.filter(pino => pino._id !== pinoId));
    logOperacao('remover pino local', pinoId);
  }, []);

  // Atualiza um pino existente (com chamada à API)
  const updatePino = useCallback(async (pinoId, dadosAtualizados) => {
    iniciarCarregamento();
    
    try {
      // Log da operação inicial
      logOperacao('atualizar pino', { pinoId, dadosAtualizados });
      
      // Chama o serviço para atualizar no servidor
      const resposta = await pinoService.atualizarPino(pinoId, dadosAtualizados);
      const pinoAtualizado = resposta.pino || resposta;
      
      // Atualiza o estado local com o pino modificado
      setPinos(prev => prev.map(pino => 
        pino._id === pinoId ? pinoAtualizado : pino
      ));
      console.log("OOOO ATUALIZACAO CONCLUIDA OOOO")
      
      // Log de sucesso
      logSucesso('atualizar pino', pinoAtualizado.nome);
      
      // Retorna o pino atualizado para possível uso pelo chamador
      return pinoAtualizado;
      
    } catch (err) {
      // Tratamento de erro
      const errorMsg = err.message || 'Erro ao atualizar pino';
      definirErro(errorMsg);
      logErro('atualizar pino', err);
      
      // Propaga o erro para que o componente chamador possa tratá-lo
      throw err;
    } finally {
      // Garante que o loading seja finalizado
      finalizarCarregamento();
    }
  }, []);

  // ===== RETORNO DO HOOK =====
  // Expõe o estado e as operações para os componentes que usarem este hook
  
  return {
    // ESTADO
    pinos,        // Lista de pinos
    loading,      // Se está carregando dados
    error,        // Mensagem de erro (null se não houver erro)
    
    // OPERAÇÕES
    fetchPinos,   // Buscar pinos do servidor
    addPino,      // Adicionar pino localmente
    removePino,   // Remover pino localmente
    updatePino,   // Atualizar pino (com API call)
    
    // HELPERS DE AUTENTICAÇÃO
    // Reexporta funções do serviço de auth para conveniência
    isAdmin: authService.isAdmin,  // Verifica se usuário é admin
    getUser: authService.getUser   // Obtém dados do usuário atual
  };
};

export default usePinosManagement;