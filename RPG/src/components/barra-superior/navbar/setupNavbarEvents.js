export function setupNavbarEvents() {
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