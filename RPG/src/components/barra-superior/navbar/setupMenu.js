export function setupUserMenu() {
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

import { isUserAdmin } from "../utils/userUtils";

// Configuração do Menu de Configurações
export function setupSettingsMenu() {
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
                window.location.href = '/src/public/apagar.html'
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