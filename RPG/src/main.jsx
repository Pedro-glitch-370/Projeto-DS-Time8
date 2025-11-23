// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.jsx'

// Marca que é uma React App para a navbar não carregar automaticamente
window.isReactApp = true;

// Carrega a navbar via script tradicional
function loadNavbarScript() {
  return new Promise((resolve) => {
    // Verifica se já existe a navbar
    if (document.querySelector('.barra-superior')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/src/components/barra-superior/barra-superior-loader.js';
    script.onload = () => {
      // Pequeno delay para garantir que o script foi executado
      setTimeout(() => {
        if (window.NavbarLoader && window.NavbarLoader.loadNavbar) {
          window.NavbarLoader.loadNavbar();
        }
        resolve();
      }, 100);
    };
    script.onerror = () => {
      console.warn('Erro ao carregar navbar, continuando sem ela...');
      resolve();
    };
    document.head.appendChild(script);
  });
}

// Carrega a navbar e depois o React
loadNavbarScript().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});