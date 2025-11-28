import { initializeUserTypeButtons } from "../utils/userTypeButtons.js";
import { validateEmailField } from "../utils/emailValidation.js";

export function setupRegisterPopup() {
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