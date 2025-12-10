import { updateNavbarForLoggedUser } from "./updateNavbarForLoggedUser.js";
import { getUserInitials, getUserName, getUserEmail, getUserType } from "../utils/userUtils.js";
import { initializeUserTypeButtons } from "../utils/userTypeButtons.js";
import { setupNavbarEvents } from "./setupNavbarEvents.js";
import { setupLoginPopup } from "../popups/setupLoginPopup.js";
import { setupRegisterPopup } from "../popups/setupRegisterPopup.js";
import { setupSettingsMenu } from "../menu/setupSettingsMenu.js";
import { setupUserMenu } from "../menu/setupUserMenu.js";

// Função principal para carregar a navbar
export function loadNavbar() {
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

          <div class="form-group">
            <label for="popupSenha">Senha *</label>
            <input type="password" id="popupSenha" name="senha" placeholder="sua senha" required>
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
            <span>🚪</span>
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
