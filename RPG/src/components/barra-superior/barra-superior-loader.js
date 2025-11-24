// Função principal para carregar a navbar
function loadNavbar() {
    // Verifica se já existe uma navbar para evitar duplicação
    if (document.querySelector('.barra-superior')) {
        updateNavbarForLoggedUser();
        initializeUserTypeButtons();
        return;
    }

    // Adiciona o CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/components/barra-superior/barra-superior.css';
    document.head.appendChild(link);

    // Adiciona a navbar - SEMPRE MOSTRA OS TRÊS TRACINHOS
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
        <div id="userSection">
          <a href="#" id="login">Entrar</a>
        </div>
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
            <div class="validation-message" id="loginEmailValidation"></div>
          </div>
          
          <button type="submit" id="loginSubmitBtn">Entrar</button>
        </form>

        <div class="register-link-container">
          <a href="#" class="register-link" id="openRegisterPopup">Não tem conta? Registre-se</a>
        </div>
        
        <div class="error" id="popupErrorMessage"></div>
        <div class="loading" id="popupLoading">Entrando...</div>
      </div>
    </div>

    <!-- Popup de Registro -->
    <div id="registerPopup" class="login-popup">
      <div class="login-popup-content">
        <span class="close-popup" id="closeRegisterPopup">&times;</span>
        <div class="logo">
          <img src="/src/assets/LogoConecta.png" alt="Recife Point Game">
        </div>
        
        <h2>Criar Conta</h2>
        
        <form id="registerForm">
          <div class="form-group">
            <label for="registerNome">Nome *</label>
            <input type="text" id="registerNome" name="nome" placeholder="Seu nome completo" required>
          </div>
          
          <div class="form-group">
            <label for="registerEmail">Email *</label>
            <input type="email" id="registerEmail" name="email" placeholder="seu@email.com" required>
            <div class="validation-message" id="registerEmailValidation"></div>
          </div>
          
          <div class="form-group">
            <label>Tipo de usuário *</label>
            <div class="user-type">
              <label>
                <input type="radio" name="tipo" value="cliente" checked>
                <span>Cliente</span>
              </label>
              <label>
                <input type="radio" name="tipo" value="admin">
                <span>Admin</span>
              </label>
            </div>
          </div>
          
          <button type="submit" id="registerSubmitBtn">Registrar</button>
        </form>

        <div class="register-link-container">
          <a href="#" class="register-link" id="openLoginPopup">Já tem uma conta? Faça login</a>
        </div>
        
        <div class="error" id="registerErrorMessage"></div>
        <div class="success" id="registerSuccessMessage"></div>
        <div class="loading" id="registerLoading">Registrando...</div>
      </div>
    </div>

    <!-- Menu do Usuário Logado -->
    <div id="userMenu" class="user-menu">
      <div class="user-menu-content">
        <div class="user-info">
          <div class="user-avatar">
            ${getUserInitials()}
          </div>
          <div class="user-details">
            <div class="user-name">${getUserName()}</div>
            <div class="user-email">${getUserEmail()}</div>
            <div class="user-type">${getUserType()}</div>
          </div>
        </div>
        <div class="user-menu-actions">
          <button id="logoutBtn" class="logout-btn">
            Sair
          </button>
        </div>
      </div>
    </div>

    <!-- Menu de Configurações -->
    <div id="settingsMenu" class="settings-menu">
      <div class="settings-menu-content">
        <div class="settings-header">
          <h3>⚙️ Configurações</h3>
          <span class="close-settings">&times;</span>
        </div>
        <div class="settings-options">
          <button class="settings-option" id="manageUsersBtn">
            <span>👥</span>
            Gerenciar Usuários
          </button>
          <button class="settings-option" id="systemSettingsBtn">
            <span>🔧</span>
            Configurações do Sistema
          </button>
          <button class="settings-option" id="backupBtn">
            <span>💾</span>
            Backup de Dados
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    // Configura os event listeners
    setupNavbarEvents();
    setupLoginPopup();
    setupRegisterPopup();
    setupUserMenu();
    setupSettingsMenu();
    
    // Atualiza a navbar para usuário logado (se estiver logado)
    updateNavbarForLoggedUser();
    
    // Inicializa os botões de tipo de usuário
    initializeUserTypeButtons();
}

// ==================================================
// VALIDADOR DE EMAIL
// ==================================================

function isValidEmail(email) {
    // Regex mais robusta para validar email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Verifica se o email corresponde ao padrão
    if (!emailRegex.test(email)) {
        return false;
    }
    
    // Verifica se tem pelo menos um @
    if (email.indexOf('@') === -1) {
        return false;
    }
    
    // Divide o email em partes
    const parts = email.split('@');
    const localPart = parts[0];
    const domainPart = parts[1];
    
    // Verifica se as partes não estão vazias
    if (!localPart || !domainPart) {
        return false;
    }
    
    // Verifica se o domínio tem pelo menos um ponto
    if (domainPart.indexOf('.') === -1) {
        return false;
    }
    
    // Verifica se o domínio tem extensão válida
    const domainParts = domainPart.split('.');
    const tld = domainParts[domainParts.length - 1];
    
    // Verifica se o TLD tem entre 2 e 6 caracteres
    if (tld.length < 2 || tld.length > 6) {
        return false;
    }
    
    // Verifica se é um TLD válido (opcional - pode comentar esta parte se quiser aceitar qualquer TLD)
    // if (!validTLDs.includes(tld.toLowerCase())) {
    //     return false;
    // }
    
    return true;
}

function validateEmailField(email, validationElement) {
    const emailValue = email.value.trim();
    
    // Limpa validação anterior
    validationElement.textContent = '';
    validationElement.className = 'validation-message';
    email.classList.remove('invalid', 'valid');
    
    if (!emailValue) {
        validationElement.textContent = 'Email é obrigatório';
        validationElement.classList.add('error');
        email.classList.add('invalid');
        return false;
    }
    
    if (!isValidEmail(emailValue)) {
        validationElement.textContent = 'Por favor, insira um email válido (ex: nome@provedor.com)';
        validationElement.classList.add('error');
        email.classList.add('invalid');
        return false;
    }
    
    // Email válido
    validationElement.textContent = '✓ Email válido';
    validationElement.classList.add('success');
    email.classList.add('valid');
    return true;
}

// ==================================================
// FUNÇÕES AUXILIARES PARA OS BOTÕES DE TIPO DE USUÁRIO
// ==================================================

// Função para garantir que os botões fiquem centralizados e funcionais
function initializeUserTypeButtons() {
    const userTypeContainers = document.querySelectorAll('.user-type');
    
    userTypeContainers.forEach(container => {
        const labels = container.querySelectorAll('label');
        const radios = container.querySelectorAll('input[type="radio"]');
        
        // Aplicar estilos CSS diretamente para garantir
        labels.forEach(label => {
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.justifyContent = 'center';
            label.style.textAlign = 'center';
            label.style.minHeight = '60px';
            
            const span = label.querySelector('span');
            if (span) {
                span.style.display = 'flex';
                span.style.alignItems = 'center';
                span.style.justifyContent = 'center';
                span.style.textAlign = 'center';
                span.style.width = '100%';
                span.style.height = '100%';
                span.style.padding = '10px 8px';
            }
        });
        
        // Configurar eventos para atualização visual
        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                updateButtonAppearance(container);
            });
        });
        
        // Estado inicial
        updateButtonAppearance(container);
    });
}

// Atualizar a aparência dos botões
function updateButtonAppearance(container) {
    const labels = container.querySelectorAll('label');
    
    labels.forEach(label => {
        const span = label.querySelector('span');
        const input = label.querySelector('input[type="radio"]');
        
        if (input.checked) {
            // Aplicar estilo selecionado
            span.style.background = 'linear-gradient(135deg, #1449c0 0%, #1e5fd9 100%)';
            span.style.color = 'white';
            span.style.boxShadow = '0 4px 12px rgba(20, 73, 192, 0.3)';
            label.style.borderColor = '#1449c0';
            
            // Adicionar ✓ se não existir
            if (span.textContent && !span.textContent.includes('✓')) {
                span.textContent = '✓ ' + span.textContent.replace('✓ ', '');
            }
        } else {
            // Aplicar estilo normal
            span.style.background = '';
            span.style.color = '#333';
            span.style.boxShadow = '';
            label.style.borderColor = '#ddd';
            
            // Remover ✓
            if (span.textContent) {
                span.textContent = span.textContent.replace('✓ ', '');
            }
        }
    });
}

// ==================================================
// FUNÇÕES AUXILIARES PARA OBTER INFORMAÇÕES DO USUÁRIO
// ==================================================

function getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

function getUserName() {
    const user = getUser();
    return user ? user.nome : 'Usuário';
}

function getUserEmail() {
    const user = getUser();
    return user ? user.email : '';
}

function getUserType() {
    const user = getUser();
    if (!user) return '';
    
    // Verifica se é admin baseado na estrutura do objeto
    if (user.tipo === 'admin' || user.isAdmin || user.role === 'admin') {
        return 'Administrador';
    }
    return 'Cliente';
}

function isUserAdmin() {
    const user = getUser();
    return user && (user.tipo === 'admin' || user.isAdmin || user.role === 'admin');
}

function getUserInitials() {
    const name = getUserName();
    if (!name || name === 'Usuário') return '👤';
    
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// ==================================================
// FUNÇÕES PRINCIPAIS DA NAVBAR
// ==================================================

// Atualiza a navbar para usuário logado
function updateNavbarForLoggedUser() {
    const user = getUser();
    const userSection = document.getElementById('userSection');
    
    if (user && userSection) {
        const firstName = user.nome ? user.nome.split(' ')[0] : 'Usuário';
        
        userSection.innerHTML = `
            <div class="user-welcome" id="userWelcome">
                <span class="user-avatar-small">${getUserInitials()}</span>
                <span class="user-name-small">Olá, ${firstName}</span>
            </div>
        `;
        
        // Adiciona evento de clique para abrir menu do usuário
        const userWelcome = document.getElementById('userWelcome');
        if (userWelcome) {
            userWelcome.addEventListener('click', (e) => {
                e.preventDefault();
                const userMenu = document.getElementById('userMenu');
                if (userMenu) {
                    userMenu.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            });
        }
    }
}

// Configuração do Menu de Configurações
function setupSettingsMenu() {
    const settingsMenu = document.getElementById('settingsMenu');
    const closeSettings = document.querySelector('.close-settings');
    const manageUsersBtn = document.getElementById('manageUsersBtn');
    const systemSettingsBtn = document.getElementById('systemSettingsBtn');
    const backupBtn = document.getElementById('backupBtn');

    // Fechar menu de configurações
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            if (settingsMenu) {
                settingsMenu.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Fechar ao clicar fora
    if (settingsMenu) {
        settingsMenu.addEventListener('click', (e) => {
            if (e.target === settingsMenu) {
                settingsMenu.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Navegação para gerenciar usuários (apenas para admin)
    if (manageUsersBtn) {
        manageUsersBtn.addEventListener('click', () => {
            if (isUserAdmin()) {
                window.location.href = 'apagar.html';
            } else {
                alert('❌ Apenas administradores podem acessar o gerenciamento de usuários.');
            }
        });
    }

    // Configurações do sistema (apenas para admin)
    if (systemSettingsBtn) {
        systemSettingsBtn.addEventListener('click', () => {
            if (isUserAdmin()) {
                alert('🔧 Configurações do sistema - Em desenvolvimento');
                // window.location.href = 'system-settings.html';
            } else {
                alert('❌ Apenas administradores podem acessar as configurações do sistema.');
            }
        });
    }

    // Backup de dados (apenas para admin)
    if (backupBtn) {
        backupBtn.addEventListener('click', () => {
            if (isUserAdmin()) {
                alert('💾 Backup de dados - Em desenvolvimento');
                // window.location.href = 'backup.html';
            } else {
                alert('❌ Apenas administradores podem acessar o backup de dados.');
            }
        });
    }

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (settingsMenu && settingsMenu.style.display === 'flex') {
                settingsMenu.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
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

    // TRÊS TRACINHOS AGORA ABREM CONFIGURAÇÕES
    const opcoes = document.getElementById('opcoes');
    if (opcoes) {
        opcoes.addEventListener('click', (e) => {
            e.preventDefault();
            const settingsMenu = document.getElementById('settingsMenu');
            if (settingsMenu) {
                settingsMenu.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }
}

function setupUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    // Fechar menu ao clicar fora
    if (userMenu) {
        userMenu.addEventListener('click', (e) => {
            if (e.target === userMenu) {
                userMenu.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.reload();
        });
    }

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && userMenu && userMenu.style.display === 'flex') {
            userMenu.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

function setupLoginPopup() {
    const loginBtn = document.getElementById('login');
    const loginPopup = document.getElementById('loginPopup');
    const closeLoginBtn = document.querySelector('#loginPopup .close-popup');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('popupErrorMessage');
    const loading = document.getElementById('popupLoading');
    const openRegisterBtn = document.getElementById('openRegisterPopup');
    const loginEmailInput = document.getElementById('popupEmail');
    const loginEmailValidation = document.getElementById('loginEmailValidation');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');

    // Configuração da API
    const API_BASE_URL = 'http://localhost:5001/api';

    // Abrir popup de login (só se não estiver logado)
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!getUser()) {
                loginPopup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                // Focar no campo de email quando abrir
                setTimeout(() => loginEmailInput.focus(), 100);
            }
        });
    }

    // Fechar popup de login
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', () => {
            loginPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Abrir popup de registro a partir do login - CORREÇÃO: não valida email
    if (openRegisterBtn) {
        openRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Limpa qualquer mensagem de validação antes de trocar
            loginEmailValidation.textContent = '';
            loginEmailValidation.className = 'validation-message';
            loginEmailInput.classList.remove('invalid', 'valid');
            
            loginPopup.style.display = 'none';
            document.getElementById('registerPopup').style.display = 'flex';
        });
    }

    // Fechar ao clicar fora do conteúdo (login) - CORREÇÃO: área de clique menor
    if (loginPopup) {
        loginPopup.addEventListener('click', (e) => {
            // Só fecha se clicar exatamente no overlay (fora do conteúdo)
            if (e.target === loginPopup) {
                loginPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // REMOVIDA: Validação em tempo real do email no login
    // Agora só valida quando o formulário é submetido

    // Login - apenas com email
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = loginEmailInput.value.trim();

            // Validação do email apenas quando o formulário é submetido
            if (!validateEmailField(loginEmailInput, loginEmailValidation)) {
                showError('Por favor, insira um email válido');
                return;
            }

            // Mostrar loading
            loading.style.display = 'block';
            errorMessage.style.display = 'none';
            loginSubmitBtn.disabled = true;

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

                    // Fechar popup
                    loginPopup.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    
                    // Atualizar navbar
                    updateNavbarForLoggedUser();
                    
                    // Recarregar a página para atualizar o estado (especialmente no React)
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                    
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
                loginSubmitBtn.disabled = false;
            }
        });

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }
}

function setupRegisterPopup() {
    const registerPopup = document.getElementById('registerPopup');
    const closeRegisterBtn = document.getElementById('closeRegisterPopup');
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('registerErrorMessage');
    const successMessage = document.getElementById('registerSuccessMessage');
    const loading = document.getElementById('registerLoading');
    const openLoginBtn = document.getElementById('openLoginPopup');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerEmailValidation = document.getElementById('registerEmailValidation');
    const registerSubmitBtn = document.getElementById('registerSubmitBtn');

    // Configuração da API
    const API_BASE_URL = 'http://localhost:5001/api';

    // Fechar popup de registro
    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', () => {
            registerPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Abrir popup de login a partir do registro - CORREÇÃO: não valida email
    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Limpa qualquer mensagem de validação antes de trocar
            registerEmailValidation.textContent = '';
            registerEmailValidation.className = 'validation-message';
            registerEmailInput.classList.remove('invalid', 'valid');
            
            registerPopup.style.display = 'none';
            document.getElementById('loginPopup').style.display = 'flex';
        });
    }

    // Fechar ao clicar fora do conteúdo (registro) - CORREÇÃO: área de clique menor
    if (registerPopup) {
        registerPopup.addEventListener('click', (e) => {
            // Só fecha se clicar exatamente no overlay (fora do conteúdo)
            if (e.target === registerPopup) {
                registerPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // REMOVIDA: Validação em tempo real do email no registro
    // Agora só valida quando o formulário é submetido

    // Inicializar botões quando o popup abrir
    if (registerPopup) {
        // Observar quando o popup de registro abrir
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (registerPopup.style.display === 'flex') {
                        setTimeout(initializeUserTypeButtons, 50);
                    }
                }
            });
        });
        
        observer.observe(registerPopup, {
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // Fechar com ESC (ambos os popups)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (registerPopup.style.display === 'flex') {
                registerPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            if (document.getElementById('loginPopup').style.display === 'flex') {
                document.getElementById('loginPopup').style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            if (document.getElementById('userMenu').style.display === 'flex') {
                document.getElementById('userMenu').style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            if (document.getElementById('settingsMenu').style.display === 'flex') {
                document.getElementById('settingsMenu').style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });

    // ==================================================
    // FUNÇÃO PARA VERIFICAR SE EMAIL JÁ EXISTE - CORRIGIDA
    // ==================================================
    
    async function checkEmailExists(email, userType) {
        try {
            console.log(`🔍 Verificando se email existe: ${email} (tipo: ${userType})`);
            
            // Método 1: Tenta buscar o usuário específico pela rota GET /:email
            let response = await fetch(`${API_BASE_URL}/auth/${userType}s/${email}`);
            
            if (response.ok) {
                // Se encontrou o usuário, email já existe
                console.log(`✅ Email encontrado como ${userType}`);
                return { exists: true, message: `Email já cadastrado como ${userType}` };
            } else if (response.status === 404) {
                // Se não encontrou (404), email não existe
                console.log(`❌ Email não encontrado como ${userType}`);
                return { exists: false, message: null };
            } else {
                // Outro erro, tenta método alternativo
                console.log(`⚠️ Erro ${response.status} na busca específica, tentando método alternativo`);
                return await checkEmailExistsAlternative(email, userType);
            }
            
        } catch (error) {
            console.error(`❌ Erro ao verificar email para ${userType}:`, error);
            // Em caso de erro, tenta o método alternativo
            return await checkEmailExistsAlternative(email, userType);
        }
    }

    // Método alternativo: busca todos os usuários e verifica na lista
    async function checkEmailExistsAlternative(email, userType) {
        try {
            console.log(`🔍 Método alternativo: buscando lista de ${userType}s`);
            
            const response = await fetch(`${API_BASE_URL}/auth/${userType}s`);
            
            if (response.ok) {
                const users = await response.json();
                const emailExists = users.some(user => user.email === email);
                console.log(`📊 Verificação alternativa: email ${emailExists ? 'EXISTE' : 'NÃO existe'} como ${userType}`);
                return { 
                    exists: emailExists, 
                    message: emailExists ? `Email já cadastrado como ${userType}` : null 
                };
            }
            
            console.log(`❌ Falha no método alternativo para ${userType}`);
            return { exists: false, message: null };
            
        } catch (error) {
            console.error(`❌ Erro no método alternativo para ${userType}:`, error);
            return { exists: false, message: null };
        }
    }

    // Registro - código para registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nome = document.getElementById('registerNome').value.trim();
            const email = registerEmailInput.value.trim();
            const tipo = document.querySelector('input[name="tipo"]:checked').value;
            
            // Validações
            if (!nome) {
                showRegisterError('Por favor, informe seu nome completo');
                return;
            }

            // Validação do email apenas quando o formulário é submetido
            if (!validateEmailField(registerEmailInput, registerEmailValidation)) {
                showRegisterError('Por favor, insira um email válido');
                return;
            }

            // Mostrar loading
            loading.style.display = 'block';
            loading.textContent = 'Verificando disponibilidade do email...';
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
            registerSubmitBtn.disabled = true;

            try {
                console.log("📝 Iniciando registro:", { nome, email, tipo });

                // ==================================================
                // VERIFICAÇÃO DE EMAIL DUPLICADO
                // ==================================================
                
                // Verifica se o email já existe como admin
                const adminCheck = await checkEmailExists(email, 'admin');
                if (adminCheck.exists) {
                    showRegisterError(`❌ Este email já está cadastrado como administrador. Use outro email ou faça login.`);
                    return;
                }

                // Verifica se o email já existe como cliente
                const clientCheck = await checkEmailExists(email, 'cliente');
                if (clientCheck.exists) {
                    showRegisterError(`❌ Este email já está cadastrado como cliente. Use outro email ou faça login.`);
                    return;
                }

                console.log("✅ Email disponível para registro");

                // Atualiza loading para "Registrando..."
                loading.textContent = 'Registrando...';

                // ==================================================
                // PROCESSO DE REGISTRO
                // ==================================================

                // Escolhe a rota baseada no tipo de usuário
                const rota = tipo === 'admin' ? '/auth/admins/register' : '/auth/clientes/register';
                
                const response = await fetch(`${API_BASE_URL}${rota}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        nome,
                        email
                    })
                });

                console.log("📡 Resposta do servidor:", response.status);

                // Verifica se a resposta é JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error("❌ Resposta não é JSON:", text);
                    
                    // Verifica se é erro de email duplicado pela mensagem de texto
                    if (text.includes('duplicate') || text.includes('já existe') || text.includes('already exists') || text.includes('Admin já existe') || text.includes('Cliente já existe')) {
                        showRegisterError('❌ Este email já está cadastrado. Use outro email ou faça login.');
                    } else {
                        showRegisterError('❌ Erro no servidor. Tente novamente.');
                    }
                    return;
                }

                const data = await response.json();
                console.log("📊 Dados recebidos:", data);
                
                if (response.ok) {
                    showRegisterSuccess('✅ Registro realizado com sucesso! Redirecionando para login...');
                    console.log("✅ Registro bem-sucedido");
                    
                    // Limpar formulário
                    registerForm.reset();
                    
                    setTimeout(() => {
                        registerPopup.style.display = 'none';
                        document.body.style.overflow = 'auto';
                        // Abre o popup de login automaticamente
                        document.getElementById('loginPopup').style.display = 'flex';
                    }, 2000);
                } else {
                    // Verifica se é erro de email duplicado
                    if (data.message && (data.message.includes('duplicate') || 
                                         data.message.includes('já existe') || 
                                         data.message.includes('already exists') ||
                                         data.message.includes('Admin já existe') ||
                                         data.message.includes('Cliente já existe') ||
                                         data.message.includes('Email') && data.message.includes('exist'))) {
                        showRegisterError('❌ Este email já está cadastrado. Use outro email ou faça login.');
                    } else {
                        throw new Error(data.message || `Erro no registro: ${response.status}`);
                    }
                }
                
            } catch (error) {
                console.error('❌ ERRO no registro:', error);
                
                if (error.message.includes('Failed to fetch')) {
                    showRegisterError('🌐 Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 5001.');
                } else if (error.message.includes('JSON')) {
                    showRegisterError('⚙️ Erro no servidor. A rota de registro pode não existir.');
                } else if (error.message.includes('email') || error.message.includes('Email')) {
                    showRegisterError(`❌ ${error.message}`);
                } else {
                    showRegisterError('❌ Erro durante o registro. Tente novamente.');
                }
            } finally {
                loading.style.display = 'none';
                registerSubmitBtn.disabled = false;
            }
        });

        function showRegisterError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
            // Restaura o texto padrão do loading
            loading.textContent = 'Registrando...';
        }

        function showRegisterSuccess(message) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
        }
    }
    
    // Inicializar botões agora
    setTimeout(initializeUserTypeButtons, 100);
}

// ==================================================
// INICIALIZAÇÃO
// ==================================================

// Para páginas HTML normais - carrega automaticamente
if (typeof window !== 'undefined' && !window.isReactApp) {
    document.addEventListener('DOMContentLoaded', function() {
        loadNavbar();
        // Inicializar botões após um pequeno delay para garantir que o DOM esteja pronto
        setTimeout(initializeUserTypeButtons, 200);
    });
}

// Para React - disponibiliza as funções globalmente
if (typeof window !== 'undefined') {
    window.NavbarLoader = {
        loadNavbar,
        setupNavbarEvents,
        updateNavbarForLoggedUser,
        initializeUserTypeButtons,
        isValidEmail,
        validateEmailField
    };
}

// Inicializar botões quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeUserTypeButtons, 300);
});