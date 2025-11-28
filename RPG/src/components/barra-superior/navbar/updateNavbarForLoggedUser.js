import { getUser, getUserInitials } from "../utils/userUtils.js";

// Atualiza a navbar para usuário logado
export function updateNavbarForLoggedUser() {
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