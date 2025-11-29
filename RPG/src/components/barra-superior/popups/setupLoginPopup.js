import { getUser } from "../utils/userUtils.js";
import { validateEmailField } from "../utils/emailValidation.js";
import { updateNavbarForLoggedUser } from "../navbar/updateNavbarForLoggedUser.js";
import { authService } from "../../../services/authService.js";

export function setupLoginPopup() {
    const loginBtn = document.getElementById('login');
    const loginPopup = document.getElementById('loginPopup');
    const closeLoginBtn = document.querySelector('#loginPopup .close-popup');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('popupErrorMessage');
    const loading = document.getElementById('popupLoading');
    const openRegisterBtn = document.getElementById('openRegisterPopup');
    const loginEmailInput = document.getElementById('popupEmail');
    const loginSenhaInput = document.getElementById('popupSenha');
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

    // Login - apenas com email
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = loginEmailInput.value.trim();
            const senha = loginSenhaInput.value.trim();

            // Validação do email apenas quando o formulário é submetido
            if (!validateEmailField(loginEmailInput, loginEmailValidation)) {
                showError('Por favor, insira um email válido');
                return;
            }

            if (!senha) {
                showError('Por favor, insira sua senha');
                return;
            }

            // Mostrar loading
            loading.style.display = 'block';
            errorMessage.style.display = 'none';
            loginSubmitBtn.disabled = true;

            try {
                const userData = await authService.login(email, senha);

                if (!userData || !userData.token) {
                    showError('Falha no login: token não recebido');
                    return;
                }

                console.log(`Usuário logado: ${userData.email} (${userData.tipo})`);

                // Fechar popup
                loginPopup.style.display = 'none';
                document.body.style.overflow = 'auto';

                // Atualizar navbar
                updateNavbarForLoggedUser();
                
                // Recarregar a página para atualizar o estado (especialmente no React)
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                    

            } catch (error) {
                console.error('Erro no login via Conecta:', error);
                showError(error.message || 'Erro ao fazer login. Tente novamente.');
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