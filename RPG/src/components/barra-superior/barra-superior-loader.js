// Loader universal para navbar
function loadNavbar() {
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
        <a href="login.html" id="login">Entrar</a>
        <div class="opcoes" id="opcoes">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', navbarHTML);
  
  // Configura os event listeners
  setupNavbarEvents();
}

function setupNavbarEvents() {
  // Logo clicável
  document.querySelector('.logo-img').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

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

// Carrega automaticamente
document.addEventListener('DOMContentLoaded', loadNavbar);