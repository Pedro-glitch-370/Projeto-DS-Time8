import api from './api';

export const authService = {
  // Login com email
  login: async (email, nome, tipo = 'cliente') => {
    try {
      const response = await api.post('/auth/login', {
        email,
        nome,
        tipo
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro no login');
    }
  },

  // Verificar usuário atual
  getCurrentUser: async (email) => {
    try {
      const response = await api.get('/auth/me', {
        params: { email }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar usuário');
    }
  },

  // Verificar se está autenticado
  isAuthenticated: () => {
    const user = localStorage.getItem('user');
    return !!user;
  },

  // Fazer logout
  logout: () => {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  },

  // Obter dados do usuário
  getUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  // No authService, adicione:
  isGuest: () => {
    const user = authService.getUser();
    return user && user.id === 'guest';
  },

  // Verificar se é admin
  isAdmin: () => {
    const user = authService.getUser();
    console.log("🔍 authService - Usuário:", user);
    console.log("🔍 authService - Tipo:", user?.tipo);
    console.log("🔍 authService - É admin?", user && user.tipo === 'admin');
    return user && user.tipo === 'admin';
  }
};