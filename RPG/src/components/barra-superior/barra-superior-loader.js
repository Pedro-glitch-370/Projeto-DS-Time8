// barra-superior-loader.js - Loader universal para navbar

// Função principal para carregar a navbar
function loadNavbar() {
    // Verifica se já existe uma navbar para evitar duplicação
    if (document.querySelector('.barra-superior')) {
        return;
    }

    // Adiciona o CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/components/barra-superior/barra-superior.css';
    document.head.appendChild(link);

    // Adiciona a navbar
    const navbarHTML = `
    <nav class="barra-superior">
      <div class="esquerda">
        <img 
          src="/src/assets/LogoConecta.png" 
          alt="Logo" 
          class="logo-img"
        />
      </div>
      <div class="meio">
        <a href="index.html">Mapa</a>
        <a href="tarefa.html">Minhas Tarefas</a>
        <a href="saldo.html">Capibas</a>
      </div>
      <div class="direita">
        <a href="#" id="login">Entrar</a>
        <div class="opcoes" id="opcoes">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </nav>
    
    <!-- Popup de Login -->
    <div id="loginPopup" class="login-popup">
      <div class="login-popup-content">
        <span class="close-popup">&times;</span>
        <div class="logo">
          <img src="/src/assets/LogoConecta.png" alt="Recife Point Game">
        </div>
        
        <h2>Entrar</h2>
        
        <form id="loginForm">
          <div class="form-group">
            <label for="popupEmail">Email *</label>
            <input type="email" id="popupEmail" name="email" placeholder="seu@email.com" required>
          </div>
          
          <button type="submit">Entrar</button>
        </form>

        <a href="register.html" class="register-link">Não tem conta? Registre-se</a>
        
        <div class="error" id="popupErrorMessage"></div>
        <div class="loading" id="popupLoading">Entrando...</div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    // Configura os event listeners
    setupNavbarEvents();
    setupLoginPopup();
}

function setupNavbarEvents() {
    // Logo clicável
    const logo = document.querySelector('.logo-img');
    if (logo) {
        logo.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Destacar link ativo
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.barra-superior .meio a');

    links.forEach(link => {
        const linkHref = link.getAttribute('href');
        const isActive = (linkHref === currentPage) || 
                        (linkHref === 'index.html' && currentPage === '') || 
                        (linkHref === 'index.html' && currentPage === '/');

        if (isActive) {
            link.classList.add('ativo');
        }

        // Navegação
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = linkHref;
        });
    });
}

function setupLoginPopup() {
    const loginBtn = document.getElementById('login');
    const popup = document.getElementById('loginPopup');
    const closeBtn = document.querySelector('.close-popup');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('popupErrorMessage');
    const loading = document.getElementById('popupLoading');

    // Configuração da API
    const API_BASE_URL = 'http://localhost:5001/api';

    // Abrir popup
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    // Fechar popup
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Fechar ao clicar fora do conteúdo
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.style.display === 'flex') {
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Login - apenas com email
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('popupEmail').value.trim();

            // Validação básica
            if (!email) {
                showError('Por favor, informe seu email');
                return;
            }

            // Mostrar loading
            loading.style.display = 'block';
            errorMessage.style.display = 'none';

            try {
                // Tenta primeiro como admin, depois como cliente
                let response = await fetch(`${API_BASE_URL}/auth/admins/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email })
                });

                if (response.status === 404 || !response.ok) {
                    // Se não for admin, tenta como cliente
                    response = await fetch(`${API_BASE_URL}/auth/clientes/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email })
                    });
                }

                const data = await response.json();

                if (response.ok) {
                    // Login bem-sucedido
                    localStorage.setItem('user', JSON.stringify(data.user || data));

                    // Fechar popup e recarregar a página
                    popup.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    window.location.reload();
                } else {
                    throw new Error(data.message || 'Email não encontrado');
                }

            } catch (error) {
                console.error('Erro no login:', error);
                if (error.message.includes('Failed to fetch')) {
                    showError('Servidor offline. Verifique se o backend está rodando na porta 5001.');
                } else {
                    showError(error.message || 'Erro ao fazer login. Tente novamente.');
                }
            } finally {
                loading.style.display = 'none';
            }
        });

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }
}

// Para páginas HTML normais - carrega automaticamente
if (typeof window !== 'undefined' && !window.isReactApp) {
    document.addEventListener('DOMContentLoaded', loadNavbar);
}

// Para React - disponibiliza as funções globalmente
if (typeof window !== 'undefined') {
    window.NavbarLoader = {
        loadNavbar,
        setupNavbarEvents
    };
}