import api from './api';

/**
 * Serviço de autenticação - gerencia login, logout e estado do usuário
 * Fornece métodos para verificar permissões e dados do usuário
 */
export const authService = {
  /**
   * Realiza o login do usuário via Conecta
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário logado + token
   * @throws {Error} Em caso de falha no login
   */
  login: async (email, senha = 'cliente') => {
    try {
      console.log(`🔐 Tentando login no Conecta: ${email}`);
      
      // Faz requisição POST para endpoint de login
      const response = await api.post('/conecta/login', {
        username: email,
        password: senha
      });

      const { token } = response.data;

      // Recupera tipo já salvo no registro via banco/localStorage
      const existingUser = authService.getCurrentUser(email);
      const tipo = existingUser?.tipo || 'cliente'; // fallback para cliente

      // Montar o objeto de usuário interno
      const userData = { email, tipo, token };
      // Salvar no localStorage
      console.log('🧾 Dados do usuário antes de salvar:', userData);
      authService.setUser(userData);
      console.log('📦 Dados salvos no localStorage');

      if (!token) {
        throw new Error('Token não recebido do Conecta');
      }
      
      console.log('✅ Login realizado com sucesso via Conecta');
      return userData;
    } catch (error) {
      console.error('❌ Erro no login via Conecta:', error);
      // Propaga mensagem de erro específica da API ou mensagem genérica
      throw new Error(error.response?.data?.message || 'Erro no login');
    }
  },

  /**
   * Busca dados do usuário atual na API
   * @param {string} email - Email do usuário a ser buscado
   * @returns {Promise<Object>} Dados atualizados do usuário
   * @throws {Error} Em caso de falha na busca
   */
  getCurrentUser: async (email) => {
    try {
      console.log(`👤 Buscando dados do usuário: ${email}`);
      
      // Faz requisição GET para endpoint de dados do usuário
      const response = await api.get('/auth/me', {
        params: { email }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar usuário');
    }
  },

  /**
   * Verifica se existe um usuário autenticado (baseado no localStorage)
   * @returns {boolean} True se usuário está autenticado, false caso contrário
   */
  isAuthenticated: () => {
    const user = localStorage.getItem('user');
    const authenticated = !!user;
    console.log(`🔍 Verificando autenticação: ${authenticated}`);
    return authenticated;
  },

  /**
   * Realiza logout do usuário, limpando dados locais e redirecionando
   */
  logout: () => {
    console.log('🚪 Realizando logout do usuário');
    // Remove dados do usuário do localStorage
    localStorage.removeItem('user');
    // Redireciona para página de login
    window.location.href = 'login.html';
  },

  /**
   * Obtém dados do usuário armazenados localmente
   * @returns {Object|null} Dados do usuário ou null se não existir
   */
  getUser: () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('📋 Dados do usuário recuperados do localStorage');
        return user;
      } catch (error) {
        console.error('❌ Erro ao parsear dados do usuário:', error);
        // Limpa dados corrompidos
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  /**
   * Verifica se o usuário atual é um convidado (guest)
   * @returns {boolean} True se for usuário guest, false caso contrário
   */
  isGuest: () => {
    const user = authService.getUser();
    const isGuest = user && user.id === 'guest';
    console.log(`🎭 É usuário guest? ${isGuest}`);
    return isGuest;
  },

  /**
   * Verifica se o usuário atual é um administrador
   * @returns {boolean} True se for admin, false caso contrário
   */
  isAdmin: () => {
    const user = authService.getUser();
    const isAdmin = user && user.tipo === 'admin';
    
    // Logs detalhados para debugging
    console.log("🔍 authService - Verificando permissões de admin:");
    console.log("👤 Usuário:", user);
    console.log("🎯 Tipo:", user?.tipo);
    console.log("✅ É admin?", isAdmin);
    
    return isAdmin;
  },

  /**
   * Verifica se o usuário atual é um cliente regular
   * @returns {boolean} True se for cliente, false caso contrário
   */
  isCliente: () => {
    const user = authService.getUser();
    const isCliente = user && user.tipo === 'cliente';
    console.log(`🛍️ É cliente? ${isCliente}`);
    return isCliente;
  },

  /**
   * Salva dados do usuário no localStorage
   * @param {Object} userData - Dados do usuário a serem salvos
   */
  setUser: (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('💾 Dados do usuário salvos no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
    }
  }
};