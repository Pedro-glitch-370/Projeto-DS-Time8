import { getUser } from "../utils/userUtils.js";
import { validateEmailField } from "../utils/emailValidation.js";
import { updateNavbarForLoggedUser } from "./updateNavbarForLoggedUser.js";

export function setupLoginPopup() {
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