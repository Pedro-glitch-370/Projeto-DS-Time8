const express = require('express');
const fetch = require('node-fetch');
const { loginConecta, consultarMoedas } = require('../controllers/conectaController');

const router = express.Router();

// Configurar a URL base da API do Conecta a de destino
const CONECTA_API_BASE = process.env.CONECTA_API_BASE || 'https://gamificacao.homolog.app.emprel.gov.br/api/provider/product-item/85890ab9-1485-4247-ada8-396842adf48f?document=88232462027';
// Opcional
const CONECTA_SERVICE_TOKEN = process.env.CONECTA_SERVICE_TOKEN || null;

// Endereço URL que fornece os dados e instruções para a build atual
const u = (path) => `${CONECTA_API_BASE}${path}`;

// Copiar os query params para a URL
function withQuery(url, query) {
  const usp = new URL(url);
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}` !== '') usp.searchParams.set(k, v);
  });
  return usp.toString();
}

// Encaminhar o cabeçalho de autorização HTTP com o Bearer Token
function buildAuthHeader(req) {
  const auth = req.headers.authorization || (CONECTA_SERVICE_TOKEN ? `Bearer ${CONECTA_SERVICE_TOKEN}` : undefined);
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = auth;
  return headers;
}

async function proxyGET(req, res, upstreamUrl) {
  try {
    const r = await fetch(upstreamUrl, { method: 'GET', headers: buildAuthHeader(req) });
    const ct = r.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? await r.json() : await r.text();
    res.status(r.status).send(body);
  } catch (err) {
    console.error('Proxy GET error:', err);
    res.status(502).json({ message: 'Upstream unavailable', error: `${err}` });
  }
}

async function proxyPOST(req, res, upstreamUrl, body = undefined) {
  try {
    const r = await fetch(upstreamUrl, {
      method: 'POST',
      headers: buildAuthHeader(req),
      body: body !== undefined ? JSON.stringify(body) : JSON.stringify(req.body || {}),
    });
    if (r.status === 204) return res.sendStatus(204);
    const ct = r.headers.get('content-type') || '';
    const respBody = ct.includes('application/json') ? await r.json() : await r.text();
    res.status(r.status).send(respBody);
  } catch (err) {
    console.error('Proxy POST error:', err);
    res.status(502).json({ message: 'Upstream unavailable', error: `${err}` });
  }
}

async function proxyPATCH(req, res, upstreamUrl) {
  try {
    const r = await fetch(upstreamUrl, {
      method: 'PATCH',
      headers: buildAuthHeader(req),
      body: JSON.stringify(req.body || {}),
    });
    const ct = r.headers.get('content-type') || '';
    const respBody = ct.includes('application/json') ? await r.json() : await r.text();
    res.status(r.status).send(respBody);
  } catch (err) {
    console.error('Proxy PATCH error:', err);
    res.status(502).json({ message: 'Upstream unavailable', error: `${err}` });
  }
}

async function proxyPUT(req, res, upstreamUrl) {
  try {
    const r = await fetch(upstreamUrl, {
      method: 'PUT',
      headers: buildAuthHeader(req),
      body: JSON.stringify(req.body || {}),
    });
    const ct = r.headers.get('content-type') || '';
    const respBody = ct.includes('application/json') ? await r.json() : await r.text();
    res.status(r.status).send(respBody);
  } catch (err) {
    console.error('Proxy PUT error:', err);
    res.status(502).json({ message: 'Upstream unavailable', error: `${err}` });
  }
}

async function proxyDELETE(req, res, upstreamUrl) {
  try {
    const r = await fetch(upstreamUrl, { method: 'DELETE', headers: buildAuthHeader(req) });
    if (r.status === 204) return res.sendStatus(204);
    const ct = r.headers.get('content-type') || '';
    const respBody = ct.includes('application/json') ? await r.json() : await r.text();
    res.status(r.status).send(respBody);
  } catch (err) {
    console.error('Proxy DELETE error:', err);
    res.status(502).json({ message: 'Upstream unavailable', error: `${err}` });
  }
}

// ================== ROTAS DE AUTENTICAÇÃO ==================

router.post('/login', loginConecta);
router.get('/moedas/:document', consultarMoedas);

// GET /api/authenticate
router.get('/conecta/authenticate', async (req, res) => {
  const url = u('/api/authenticate');
  await proxyGET(req, res, url);
});

// POST /api/authenticate – espera username, senha e rememberMe
router.post('/conecta/authenticate', async (req, res) => {
  const url = u('/api/authenticate');
  await proxyPOST(req, res, url);
});

// POST /api/authenticate/conecta
router.post('/conecta/authenticate/conecta', async (req, res) => {
  const url = u('/api/authenticate/conecta');
  await proxyPOST(req, res, url);
});

// ================== ROTAS DE PERFIL PRÓPRIO DE USUÁRIO ==================

// GET /api/self
router.get('/conecta/self', async (req, res) => {
  const url = u('/api/self');
  await proxyGET(req, res, url);
});

// GET /api/self-image
router.get('/conecta/self-image', async (req, res) => {
  const url = u('/api/self-image');
  await proxyGET(req, res, url);
});

// POST /api/self/join
router.post('/conecta/self/join', async (req, res) => {
  const url = u('/api/self/join');
  await proxyPOST(req, res, url);
});

// ================== ROTAS DE DESAFIOS, AÇÕES, PRODUTOS, CONQUISTAS ==================

router.get('/conecta/self/challenges', async (req, res) => {
  const url = withQuery(u('/api/self/challenges'), req.query);
  await proxyGET(req, res, url);
});

router.get('/conecta/self/actions', async (req, res) => {
  const url = withQuery(u('/api/self/actions'), req.query);
  await proxyGET(req, res, url);
});

router.get('/conecta/self/achievements', async (req, res) => {
  const url = u('/api/self/achievements');
  await proxyGET(req, res, url);
});

router.get('/conecta/self/transfers', async (req, res) => {
  const url = withQuery(u('/api/self/transfers'), req.query);
  await proxyGET(req, res, url);
});

router.get('/conecta/self/orders', async (req, res) => {
  const url = withQuery(u('/api/self/orders'), req.query);
  await proxyGET(req, res, url);
});

router.get('/conecta/self/products', async (req, res) => {
  const url = withQuery(u('/api/self/products'), req.query);
  await proxyGET(req, res, url);
});

// ================== ROTAS DE DESAFIOS ==================

// POST /api/challenges/{id}/share/{requirementId}
router.post('/conecta/challenges/:id/share/:requirementId', async (req, res) => {
  const { id, requirementId } = req.params;
  const url = u(`/api/challenges/${id}/share/${requirementId}`);
  await proxyPOST(req, res, url);
});

// GET /api/questions/challenge/{challengeId}
router.get('/conecta/questions/challenge/:challengeId', async (req, res) => {
  const { challengeId } = req.params;
  const url = u(`/api/questions/challenge/${challengeId}`);
  await proxyGET(req, res, url);
});

// ================== ROTAS DE CHENK IN ==================

// POST /api/check-in
router.post('/conecta/check-in', async (req, res) => {
  const url = u('/api/check-in');
  await proxyPOST(req, res, url, req.body);
});

// POST /api/check-in/location/challenge/{challengeId}/requirement/{requirementId}
router.post('/conecta/check-in/location/challenge/:challengeId/requirement/:requirementId', async (req, res) => {
  const { challengeId, requirementId } = req.params;
  const url = u(`/api/check-in/location/challenge/${challengeId}/requirement/${requirementId}`);
  await proxyPOST(req, res, url, req.body);
});

// ================== ROTAS DE CATEGORIAS PÚBLICAS ==================

// GET /api/categories
router.get('/conecta/categories', async (req, res) => {
  const url = withQuery(u('/api/categories'), req.query);
  await proxyGET(req, res, url);
});

// ================== ROTAS DE USUÁRIO ==================

router.get('/conecta/admin/users', async (req, res) => {
  const url = withQuery(u('/api/admin/users'), req.query);
  await proxyGET(req, res, url);
});

router.get('/conecta/admin/users/:login', async (req, res) => {
  const url = u(`/api/admin/users/${req.params.login}`);
  await proxyGET(req, res, url);
});

router.delete('/conecta/admin/users/:login', async (req, res) => {
  const url = u(`/api/admin/users/${req.params.login}`);
  await proxyDELETE(req, res, url);
});

// Challenges
router.get('/conecta/admin/challenges', async (req, res) => {
  const url = withQuery(u('/api/admin/challenges'), req.query);
  await proxyGET(req, res, url);
});

router.post('/conecta/admin/challenges/:id/activate', async (req, res) => {
  const url = u(`/api/admin/challenges/${req.params.id}/activate`);
  await proxyPOST(req, res, url, {});
});

router.post('/conecta/admin/challenges/:id/deactivate', async (req, res) => {
  const url = u(`/api/admin/challenges/${req.params.id}/deactivate`);
  await proxyPOST(req, res, url, {});
});

// Produtos
router.get('/conecta/admin/products', async (req, res) => {
  const url = u('/api/admin/products');
  await proxyGET(req, res, url);
});

router.post('/conecta/admin/products/:id/activate', async (req, res) => {
  const url = u(`/api/admin/products/${req.params.id}/activate`);
  await proxyPOST(req, res, url, {});
});

router.post('/conecta/admin/products/:id/deactivate', async (req, res) => {
  const url = u(`/api/admin/products/${req.params.id}/deactivate`);
  await proxyPOST(req, res, url, {});
});

router.get('/conecta/admin/products/:id/info', async (req, res) => {
  const url = u(`/api/admin/products/${req.params.id}/info`);
  await proxyGET(req, res, url);
});

// Itens de produtos
router.get('/conecta/admin/product-items', async (req, res) => {
  const url = withQuery(u('/api/admin/product-items'), req.query);
  await proxyGET(req, res, url);
});

router.get('/conecta/admin/product-items/:id', async (req, res) => {
  const url = u(`/api/admin/product-items/${req.params.id}`);
  await proxyGET(req, res, url);
});

router.get('/conecta/admin/product-items/:id/redemption', async (req, res) => {
  const url = u(`/api/admin/product-items/${req.params.id}/redemption`);
  await proxyGET(req, res, url);
});

router.get('/conecta/admin/product-items/code/:code', async (req, res) => {
  const url = u(`/api/admin/product-items/code/${req.params.code}`);
  await proxyGET(req, res, url);
});

// Categories
router.get('/conecta/admin/categories', async (req, res) => {
  const url = withQuery(u('/api/admin/categories'), req.query);
  await proxyGET(req, res, url);
});

// Requirements
router.get('/conecta/admin/requirements', async (req, res) => {
  const url = u('/api/admin/requirements');
  await proxyGET(req, res, url);
});

// Action reporters
router.get('/conecta/admin/action-reporters', async (req, res) => {
  const url = u('/api/admin/action-reporters');
  await proxyGET(req, res, url);
});

// Authorities
router.get('/conecta/admin/authorities', async (req, res) => {
  const url = u('/api/admin/authorities');
  await proxyGET(req, res, url);
});

module.exports = router