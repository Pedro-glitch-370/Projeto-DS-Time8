import axios from "axios";

// Cria uma instância customizada do Axios com configurações padrão
const api = axios.create({
  baseURL: "http://localhost:5001/api",
  timeout: 5000,
});

// Interceptor para adicionar dados do usuário automaticamente
api.interceptors.request.use(
  (config) => {
    // Adiciona dados do usuário no header se estiver logado
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        // Apenas verifica se é um JSON válido, mas não precisa da variável 'user'
        JSON.parse(userData); // Isso valida o JSON
        config.headers['user-data'] = userData;
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        // Remove dados inválidos do localStorage
        localStorage.removeItem('user');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Não autenticado - redireciona para login
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    } else if (error.response?.status === 403) {
      // Acesso negado
      alert('Acesso negado. Apenas administradores podem realizar esta ação.');
    }
    return Promise.reject(error);
  }
);

export default api;