import api from './api';

/**
 * Serviço de autenticação - gerencia login, logout e estado do usuário
 * Fornece métodos para verificar permissões e dados do usuário
 */
export const authService = {
  /**
   * Realiza o login do usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário logado
   * @throws {Error} Em caso de falha no login
   */
  login: async (email, senha) => {
    try {
      if (!email) {
        throw new Error('Email é obrigatório');
      }

      if (!senha) {
        throw new Error('Senha é obrigatória')
      }

      console.log(`🔐 Tentando login local: ${email}`);

      // Primeiro testa se é um admin
      let response;
      try {
        response = await api.post('/auth/admins/login', { email, senha });
      } catch (err) {
        // Depois testa se é um cliente/user normal
        if (err.response?.status === 401 || err.response?.status === 404 || err.response?.status === 400) {
          response = await api.post('/auth/clientes/login', { email, senha });
        } else {
          throw err;
        }
      }

      const { user } = response.data;
      if (!user) throw new Error('Usuário não encontrado ou credenciais inválidas');

      // Salva no localStorage
      authService.setUser(user);
      api.defaults.headers['user-data'] = JSON.stringify(user);

      console.log("📦 User salvo no localStorage:", user);
      console.log('✅ Login realizado com sucesso!');
      return user;
    } catch (error) {
      console.error('❌ Erro no login local:', error);
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
    window.dispatchEvent(new Event("userChanged"));
    // Redireciona para página de login
    //window.location.href = 'login.html';
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
      localStorage.setItem("user", JSON.stringify(userData));
      window.dispatchEvent(new Event("userChanged"));
      console.log('💾 Dados do usuário salvos no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
    }
  }
};