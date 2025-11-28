export function initializeUserTypeButtons() {
    const userTypeContainers = document.querySelectorAll('.user-type');
    
    userTypeContainers.forEach(container => {
        const labels = container.querySelectorAll('label');
        const radios = container.querySelectorAll('input[type="radio"]');
        
        // Aplicar estilos CSS diretamente para garantir
        labels.forEach(label => {
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.justifyContent = 'center';
            label.style.textAlign = 'center';
            label.style.minHeight = '60px';
            
            const span = label.querySelector('span');
            if (span) {
                span.style.display = 'flex';
                span.style.alignItems = 'center';
                span.style.justifyContent = 'center';
                span.style.textAlign = 'center';
                span.style.width = '100%';
                span.style.height = '100%';
                span.style.padding = '10px 8px';
            }
        });
        
        // Configurar eventos para atualização visual
        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                updateButtonAppearance(container);
            });
        });
        
        // Estado inicial
        updateButtonAppearance(container);
    });
}

// Atualizar a aparência dos botões
export function updateButtonAppearance(container) {
    const labels = container.querySelectorAll('label');
    
    labels.forEach(label => {
        const span = label.querySelector('span');
        const input = label.querySelector('input[type="radio"]');
        
        if (input.checked) {
            // Aplicar estilo selecionado
            span.style.background = 'linear-gradient(135deg, #1449c0 0%, #1e5fd9 100%)';
            span.style.color = 'white';
            span.style.boxShadow = '0 4px 12px rgba(20, 73, 192, 0.3)';
            label.style.borderColor = '#1449c0';
            
            // Adicionar ✓ se não existir
            if (span.textContent && !span.textContent.includes('✓')) {
                span.textContent = '✓ ' + span.textContent.replace('✓ ', '');
            }
        } else {
            // Aplicar estilo normal
            span.style.background = '';
            span.style.color = '#333';
            span.style.boxShadow = '';
            label.style.borderColor = '#ddd';
            
            // Remover ✓
            if (span.textContent) {
                span.textContent = span.textContent.replace('✓ ', '');
            }
        }
    });
}