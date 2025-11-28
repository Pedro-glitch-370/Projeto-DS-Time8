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