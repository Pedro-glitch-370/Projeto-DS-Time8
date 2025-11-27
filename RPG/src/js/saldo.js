      // Lógica do carrossel
      let slideIndex = 0;
      let autoRotate;
      
      function mudarSlide(n) {
        const slides = document.querySelectorAll('.pessoa');
        slideIndex += n;
        
        if (slideIndex >= slides.length) slideIndex = 0;
        if (slideIndex < 0) slideIndex = slides.length - 1;
        
        const carrossel = document.querySelector('.carrossel');
        carrossel.style.transform = `translateX(-${slideIndex * 100}%)`;
        
        // Reiniciar auto-rotate
        clearInterval(autoRotate);
        iniciarAutoRotate();
      }

      function iniciarAutoRotate() {
        autoRotate = setInterval(() => {
          mudarSlide(1);
        }, 5000);
      }

      // Iniciar auto-rotate quando a página carregar
      document.addEventListener('DOMContentLoaded', function() {
        iniciarAutoRotate();
        
        // Configurar eventos da navbar
        const links = document.querySelectorAll('.barra-superior .meio a');
        links.forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = link.getAttribute('href');
          });
        });

        // Logo clicável
        document.querySelector('.logo-img').addEventListener('click', () => {
          window.location.href = 'index.html';
        });
      });

      // Pausar auto-rotate quando o mouse estiver sobre o carrossel
      document.querySelector('.carrossel-container').addEventListener('mouseenter', () => {
        clearInterval(autoRotate);
      });

      // Retomar auto-rotate quando o mouse sair do carrossel
      document.querySelector('.carrossel-container').addEventListener('mouseleave', () => {
        iniciarAutoRotate();
      });