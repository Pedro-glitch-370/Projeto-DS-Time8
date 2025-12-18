const API_URL = 'http://localhost:5001/api'; 

export const grupoService = {
  criarGrupo: async (dados) => {
    const response = await fetch(`${API_URL}/grupos/criar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    return await response.json();
  },

  entrarGrupo: async (codigo, usuarioId) => {
    const response = await fetch(`${API_URL}/grupos/entrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, usuarioId })
    });
    return await response.json();
  },

  getRanking: async () => {
    const response = await fetch(`${API_URL}/grupos/ranking`);
    return await response.json();
  }
};