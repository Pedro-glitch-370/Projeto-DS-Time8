// Criar partículas dinâmicas
function createParticles() {
const particlesContainer = document.getElementById('particles');
const particleCount = 15;

for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Posição e tamanho aleatórios
    const size = Math.random() * 10 + 5;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = Math.random() * 3 + 3;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    
    particlesContainer.appendChild(particle);
}
}

// Remover loading quando o React carregar
function hideLoading() {
const loading = document.getElementById('loading');
if (loading) {
    // Adicionar fade out
    loading.style.opacity = '0';
    loading.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
    loading.style.display = 'none';
    }, 500);
}
}

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
createParticles();

// Tentar detectar quando o React terminar de carregar
const checkReactLoaded = setInterval(() => {
    // Verifica se o elemento root tem conteúdo além do loading
    const root = document.getElementById('root');
    if (root && root.children.length > 1) {
    clearInterval(checkReactLoaded);
    hideLoading();
    }
}, 100);

// Fallback: esconder após 3 segundos
setTimeout(() => {
    clearInterval(checkReactLoaded);
    hideLoading();
}, 3000);
});

// Prevenir scroll durante o loading
document.body.style.overflow = 'hidden';
window.addEventListener('load', () => {
setTimeout(() => {
    document.body.style.overflow = 'auto';
}, 1000);
});