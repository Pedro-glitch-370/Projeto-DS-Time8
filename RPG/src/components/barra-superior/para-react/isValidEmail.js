export function isValidEmail(email) {
    // Regex mais robusta para validar email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Verifica se o email corresponde ao padrão
    if (!emailRegex.test(email)) {
        return false;
    }
    
    // Verifica se tem pelo menos um @
    if (email.indexOf('@') === -1) {
        return false;
    }
    
    // Divide o email em partes
    const parts = email.split('@');
    const localPart = parts[0];
    const domainPart = parts[1];
    
    // Verifica se as partes não estão vazias
    if (!localPart || !domainPart) {
        return false;
    }
    
    // Verifica se o domínio tem pelo menos um ponto
    if (domainPart.indexOf('.') === -1) {
        return false;
    }
    
    // Verifica se o domínio tem extensão válida
    const domainParts = domainPart.split('.');
    const tld = domainParts[domainParts.length - 1];
    
    // Lista de TLDs válidos (pode ser expandida)
    const validTLDs = ['com', 'org', 'net', 'edu', 'gov', 'br']
    
    // Verifica se o TLD tem entre 2 e 6 caracteres
    if (tld.length < 2 || tld.length > 6) {
        return false;
    }

    // Verifica se é um TLD válido
    if (!validTLDs.includes(tld.toLowerCase())) {
        return false;
    }
    
    return true;
}