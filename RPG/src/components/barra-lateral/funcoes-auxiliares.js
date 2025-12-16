export const validateForm = (nome, msg) => {
  if (!nome || !msg) {
    alert("Preencha o nome e a mensagem.");
    return false;
  }
  
  return true;
};

export const extractCoordinates = (pino) => {
  if (pino.localizacao?.coordinates?.length === 2) {
    return pino.localizacao.coordinates;
  }
  if (pino.coordinates?.length === 2) {
    return pino.coordinates;
  }
  
  console.warn('Usando coordenadas padrão');
  return [-34.8713, -8.0631];
};

export const logDebugInfo = (operation, data) => {
  console.log(`🔍 ${operation}:`, data);
};