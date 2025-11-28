import { loadNavbar } from "./navbar/loadNavbar.js";
import { initializeUserTypeButtons } from "./utils/userTypeButtons.js";

// ==================================================
// INICIALIZAÇÃO
// ==================================================

// Para páginas HTML normais - carrega automaticamente
if (typeof window !== 'undefined' && !window.isReactApp) {
    document.addEventListener('DOMContentLoaded', function() {
        loadNavbar();
        // Inicializar botões após um pequeno delay para garantir que o DOM esteja pronto
        setTimeout(initializeUserTypeButtons, 200);
    });
}

// Inicializar botões quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeUserTypeButtons, 300);
});