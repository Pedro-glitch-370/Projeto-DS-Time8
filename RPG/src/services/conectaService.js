/**
 * O login no Conecta é pelo backend
 * @param {string} email - Email do usuário do Conecta)
 * @param {string} senha - Senha do usuário do Conecta)
 * @returns {Promise<object>} - Retorna o token ou erro
 */

export async function loginConecta(email, senha) {
  try {
    const res = await fetch('/api/conecta/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password: senha })
    });

    if (!res.ok) {
      throw new Error(`Erro no login: ${res.status}`);
    }

    return await res.json(); // o resultado aqui vai ser um { token: "..." }
  } catch (err) {
    console.error('Falha ao autenticar no Conecta:', err);
    throw err;
  }
}

/**
 * Consulta saldo de moedas do cidadão
 * @param {string} document - CPF do usuário
 * @returns {Promise<object>} - Retorna os dados sobre os Capibas
 */

export async function consultarMoedas(document) {
  try {
    const res = await fetch(`/api/conecta/moedas/${document}`, {
      method: 'GET'
    });

    if (!res.ok) {
      throw new Error(`Erro ao consultar moedas: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('Falha ao consultar moedas:', err);
    throw err;
  }
}
