import axios from "axios";

/**
 * Cria uma instância customizada do Axios com configurações padrão
 * Esta instância será usada para todas as chamadas API da aplicação
 */
const api = axios.create({
  baseURL: "http://localhost:5001/api", // URL base da API
  timeout: 5000, // Timeout de 5 segundos para todas as requisições
});

/**
 * Interceptor de requisição - executa antes de cada chamada API
 * Adiciona automaticamente dados do usuário no header se disponível
 */
api.interceptors.request.use(
  (config) => {
    // Recupera dados do usuário do localStorage
    const userData = localStorage.getItem('user');
    
    // Se existir dados do usuário, adiciona no header da requisição
    if (userData) {
      try {
        // Valida se os dados são um JSON válido (sem usar a variável)
        JSON.parse(userData); // Apenas para validação - não armazena resultado
        // Adiciona os dados do usuário no header personalizado
        config.headers['user-data'] = userData;
        
        console.log('🔐 Dados do usuário adicionados ao header da requisição');
      } catch (error) {
        // Se os dados forem inválidos, limpa o localStorage
        console.error('❌ Erro ao parsear dados do usuário:', error);
        localStorage.removeItem('user');
        console.log('🧹 Dados inválidos removidos do localStorage');
      }
    } else {
      console.log('👤 Nenhum usuário logado - requisição sem autenticação');
    }
    
    return config;
  },
  (error) => {
    // Em caso de erro na configuração da requisição
    console.error('❌ Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de resposta - executa após cada resposta API
 * Trata erros globais como autenticação e autorização
 */
api.interceptors.response.use(
  (response) => {
    // Em caso de sucesso, simplesmente retorna a resposta
    console.log('✅ Requisição bem-sucedida:', response.status);
    return response;
  },
  (error) => {
    // Em caso de erro na resposta
    console.error('❌ Erro na resposta da API:', error.response?.status);
    
    // Tratamento específico para erro 401 - Não autorizado
    if (error.response?.status === 401) {
      console.log('🔒 Usuário não autenticado - redirecionando para login');
      // Remove dados do usuário do localStorage
      localStorage.removeItem('user');
      // Redireciona para página de login
      window.location.href = 'login.html';
    } 
    // Tratamento específico para erro 403 - Acesso negado
    else if (error.response?.status === 403) {
      console.log('🚫 Acesso negado - usuário não tem permissão');
      // Exibe alerta para o usuário
      alert('Acesso negado. Apenas administradores podem realizar esta ação.');
    }
    // Para outros tipos de erro
    else if (error.response) {
      console.error('📊 Detalhes do erro:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } 
    // Para erros de rede ou timeout
    else if (error.request) {
      console.error('🌐 Erro de rede - nenhuma resposta recebida:', error.request);
    } 
    // Para outros erros
    else {
      console.error('⚡ Erro na configuração da requisição:', error.message);
    }
    
    // Rejeita a promise para que o chamador possa tratar o erro se necessário
    return Promise.reject(error);
  }
);

export default api;