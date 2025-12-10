export function getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

export function getUserName() {
    const user = getUser();
    return user ? user.nome : 'Usuário';
}

export function getUserEmail() {
    const user = getUser();
    return user ? user.email : '';
}

export function getUserType() {
    const user = getUser();
    if (!user) return '';
    
    // Verifica se é admin baseado na estrutura do objeto
    if (user.tipo === 'admin' || user.isAdmin || user.role === 'admin') {
        return 'Administrador';
    }
    return 'Cliente';
}

export function isUserAdmin() {
    const user = getUser();
    return user && (user.tipo === 'admin' || user.isAdmin || user.role === 'admin');
}

export function getUserInitials() {
    const name = getUserName();
    if (!name || name === 'Usuário') return '👤';
    
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}