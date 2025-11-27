// Configuration
const API_BASE_URL = 'http://localhost:5001/api/auth';
let currentUser = null;
let userToDelete = null;

// UI Elements
const elements = {
    currentUser: document.getElementById('currentUser'),
    errorMessage: document.getElementById('errorMessage'),
    successMessage: document.getElementById('successMessage'),
    adminsList: document.getElementById('adminsList'),
    clientesList: document.getElementById('clientesList'),
    loadingAdmins: document.getElementById('loadingAdmins'),
    loadingClientes: document.getElementById('loadingClientes'),
    totalAdmins: document.getElementById('totalAdmins'),
    totalClientes: document.getElementById('totalClientes'),
    totalUsers: document.getElementById('totalUsers'),
    confirmModal: document.getElementById('confirmModal'),
    modalMessage: document.getElementById('modalMessage'),
    confirmDelete: document.getElementById('confirmDelete')
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUsers();
});

// Check Authentication
function checkAuth() {
    const userData = localStorage.getItem('user');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = JSON.parse(userData);
    if (currentUser.tipo !== 'admin') {
        showError('❌ Acesso negado. Apenas administradores podem acessar este painel.');
        setTimeout(() => window.location.href = 'index.html', 3000);
        return;
    }

    elements.currentUser.textContent = `👋 Olá, ${currentUser.nome} (${currentUser.email})`;
}

// Load Users
async function loadUsers() {
    try {
        console.log('🔄 Iniciando carregamento de usuários...');
        
        const adminsResponse = await fetch(`${API_BASE_URL}/admins`);
        console.log('📊 Status da resposta admins:', adminsResponse.status);
        
        if (adminsResponse.ok) {
            const admins = await adminsResponse.json();
            console.log('👨‍💼 Admins carregados:', admins);
            displayAdmins(admins);
            elements.totalAdmins.textContent = admins.length;
        } else {
            const errorText = await adminsResponse.text();
            console.error('❌ Erro detalhado ao carregar admins:', errorText);
            throw new Error(`Erro ${adminsResponse.status}: ${adminsResponse.statusText}`);
        }

        const clientesResponse = await fetch(`${API_BASE_URL}/clientes`);
        console.log('📊 Status da resposta clientes:', clientesResponse.status);
        
        if (clientesResponse.ok) {
            const clientes = await clientesResponse.json();
            console.log('👥 Clientes carregados:', clientes);
            displayClientes(clientes);
            elements.totalClientes.textContent = clientes.length;
        } else {
            const errorText = await clientesResponse.text();
            console.error('❌ Erro detalhado ao carregar clientes:', errorText);
            throw new Error(`Erro ${clientesResponse.status}: ${clientesResponse.statusText}`);
        }

        // Update total
        elements.totalUsers.textContent = 
            parseInt(elements.totalAdmins.textContent) + 
            parseInt(elements.totalClientes.textContent);

        console.log('✅ Usuários carregados com sucesso!');

    } catch (error) {
        console.error('❌ Erro completo ao carregar usuários:', error);
        showError(`❌ Erro ao carregar usuários: ${error.message}`);
        
        // Mostrar estado vazio em caso de erro
        elements.loadingAdmins.style.display = 'none';
        elements.loadingClientes.style.display = 'none';
        
        elements.adminsList.innerHTML = `
            <div class="empty-state">
                <h3>⚠️ Erro ao carregar</h3>
                <p>Não foi possível carregar os administradores.</p>
            </div>
        `;
        
        elements.clientesList.innerHTML = `
            <div class="empty-state">
                <h3>⚠️ Erro ao carregar</h3>
                <p>Não foi possível carregar os clientes.</p>
            </div>
        `
    }
}

// Display Admins
function displayAdmins(admins) {
    elements.loadingAdmins.style.display = 'none';
    
    if (!admins || admins.length === 0) {
        elements.adminsList.innerHTML = `
            <div class="empty-state">
                <h3>📭 Nenhum administrador encontrado</h3>
                <p>Não há administradores cadastrados no sistema.</p>
            </div>
        `;
        return;
    }

    elements.adminsList.innerHTML = admins.map(admin => `
        <div class="user-card">
            <div class="user-info-card">
                <div class="user-name">${admin.nome}</div>
                <div class="user-email">📧 ${admin.email}</div>
                <div class="user-details">
                    <span class="user-type admin">👑 Administrador</span>
                    <span class="user-stats">🛠️ ${admin.permissoes ? admin.permissoes.length : 0} permissões</span>
                </div>
            </div>
            <div class="user-actions">
                <button class="delete-btn" onclick="confirmDelete('admin', '${admin._id}', '${admin.nome}')">
                    🗑️ Excluir
                </button>
            </div>
        </div>
    `).join('');
}

// Display Clients
function displayClientes(clientes) {
    elements.loadingClientes.style.display = 'none';
    
    if (!clientes || clientes.length === 0) {
        elements.clientesList.innerHTML = `
            <div class="empty-state">
                <h3>📭 Nenhum cliente encontrado</h3>
                <p>Não há clientes cadastrados no sistema.</p>
            </div>
        `;
        return;
    }

    elements.clientesList.innerHTML = clientes.map(cliente => `
        <div class="user-card">
            <div class="user-info-card">
                <div class="user-name">${cliente.nome}</div>
                <div class="user-email">📧 ${cliente.email}</div>
                <div class="user-details">
                    <span class="user-type cliente">👤 Cliente</span>
                    <span class="user-stats">🪙 ${cliente.capibas || 0} capibas</span>
                    ${cliente.tarefasCompletas ? `<span class="user-stats">✅ ${cliente.tarefasCompletas} tarefas</span>` : ''}
                </div>
            </div>
            <div class="user-actions">
                <button class="delete-btn" onclick="confirmDelete('cliente', '${cliente._id}', '${cliente.nome}')">
                    🗑️ Excluir
                </button>
            </div>
        </div>
    `).join('');
}

// Confirm Delete
function confirmDelete(type, id, name) {
    userToDelete = { type, id, name };
    elements.modalMessage.textContent = `Tem certeza que deseja excluir "${name}" (${type})? Esta ação não pode ser desfeita.`;
    elements.confirmModal.style.display = 'flex';
}

// Close Modal
function closeModal() {
    elements.confirmModal.style.display = 'none';
    userToDelete = null;
}

// Delete User
elements.confirmDelete.addEventListener('click', async function() {
    if (!userToDelete) return;

    try {
        console.log(`🗑️ Tentando excluir ${userToDelete.type} com ID: ${userToDelete.id}`);
        
        const response = await fetch(`${API_BASE_URL}/${userToDelete.type}s/${userToDelete.id}`, {
            method: 'DELETE'
        });

        console.log('📊 Resposta da exclusão:', response.status, response.statusText);

        if (response.ok) {
            showSuccess(`✅ ${userToDelete.type.charAt(0).toUpperCase() + userToDelete.type.slice(1)} "${userToDelete.name}" excluído com sucesso!`);
            closeModal();
            // Recarregar a lista
            loadUsers();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro ${response.status} ao excluir usuário`);
        }
    } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error);
        showError(`❌ ${error.message || 'Erro ao excluir usuário'}`);
    }
});

// Tab Navigation
function openTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Show Messages
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'block';
    elements.successMessage.style.display = 'none';
    
    setTimeout(() => {
        elements.errorMessage.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    elements.successMessage.textContent = message;
    elements.successMessage.style.display = 'block';
    elements.errorMessage.style.display = 'none';
    
    setTimeout(() => {
        elements.successMessage.style.display = 'none';
    }, 3000);
}

// Close modal on outside click
window.addEventListener('click', function(event) {
    if (event.target === elements.confirmModal) {
        closeModal();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});