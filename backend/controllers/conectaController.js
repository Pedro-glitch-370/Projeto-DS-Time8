const fetch = require('node-fetch');

// ================== CONTROLADOR CONECTA ==================

const CONECTA_AUTH_URL = process.env.CONECTA_AUTH_URL || 'https://loginteste.recife.pe.gov.br/auth/realms/recife/protocol/openid-connect/token';
const GAMIFICACAO_API_BASE = process.env.GAMIFICACAO_API_BASE || 'https://gamificacao.homolog.app.emprel.gov.br/api';

// Faz login no Conecta e retorna o access_token
async function loginConecta(req, res) {
  const { username, password } = req.body;

  try {
    // Como o Conecta não está funcionando, foi feita essa checagem forçada
    const validUser = username === "88232462027";
    const validPass = password === "desenv@12345";
    console.log(validUser);
    console.log(validPass);
    if (!validUser || !validPass) {
      return res.status(401).json({ error: "Username ou senha inválida para usuário de teste" });
    }

    const response = await fetch(CONECTA_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'app-recife',
        username,
        password
      })
    });
    console.log("Tentando login no Conecta com:", username, password);
    const data = await response.json();
    console.log("Resposta do Conecta:", data);
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error_description || 'Erro no login' });
    }

    return res.json({ token: data.access_token });
  } catch (err) {
    console.error('Erro ao autenticar no Conecta:', err);
    return res.status(500).json({ error: 'Falha na autenticação' });
  }
}

// Consultar saldo de moedas
async function consultarMoedas(req, res) {
  const { document } = req.params;

  try {
    const response = await fetch(`${GAMIFICACAO_API_BASE}/provider/product-item/85890ab9-1485-4247-ada8-396842adf48f?document=${document}`, {
      headers: {
        Authorization: 'Basic dGVzdDp0ZXN0' // depois o código vai ter que ser Bearer <token>
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Erro ao consultar moedas' });
    }

    return res.json(data);
  } catch (err) {
    console.error('Erro ao consultar moedas:', err);
    return res.status(500).json({ error: 'Falha na consulta de moedas' });
  }
}

module.exports = {
  loginConecta,
  consultarMoedas
};
