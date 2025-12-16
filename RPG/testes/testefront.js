import assert from 'assert';
import { pinoService } from '../src/services/pinoService.js';

// localStorage mockado para rodar em node
globalThis.localStorage = {
  _store: {},

  getItem(key) {
    return this._store[key] || null;
  },

  setItem(key, value) {
    this._store[key] = String(value);
  },

  removeItem(key) {
    delete this._store[key];
  },

  clear() {
    this._store = {};
  }
};

// Simula com o token real
localStorage.setItem('token', 'dGVzdDp0ZXN0');

// Funções que chamam o pinoService
// Teste para adicionar o pino
async function testeAdicionarPino() {
  const novoPino = {
    nome: 'Pino Teste',
    msg: 'Mensagem de teste',
    capibas: 10,
    latitude: -8.05,
    longitude: -34.9
  };

  const pinoCriado = await pinoService.adicionarPino(novoPino);

assert.ok(pinoCriado.pino._id, 'Pino criado deve ter um _id');
assert.strictEqual(pinoCriado.pino.nome, 'Pino Teste');
  console.log('✅ Teste adicionarPino passou');
}

// Teste para atualizar o pino
async function testeAtualizarPino(pinoId) {
  const dadosAtualizados = {
    nome: 'Pino Atualizado',
    msg: 'Mensagem atualizada',
    capibas: 20,
    latitude: -8.06,
    longitude: -34.91
  };

  const pinoAtualizado = await pinoService.atualizarPino(pinoId, dadosAtualizados);

  assert.strictEqual(pinoAtualizado.pino.nome, 'Pino Atualizado', 'Nome deve ser atualizado');
  console.log('✅ Teste atualizarPino passou');
}

// Teste para deletar o pino
async function testeDeletarPino(pinoId) {
  const resposta = await pinoService.deletarPino(pinoId);

  assert.ok(resposta.success || resposta.message, 'Resposta deve indicar sucesso ou mensagem');
  console.log('✅ Teste deletarPino passou');
}

// Teste para pegar todos os pinos existentes
async function testeGetPinos() {
  const pinos = await pinoService.getPinos();

  assert.ok(Array.isArray(pinos), 'getPinos deve retornar um array');
  console.log(`✅ Teste getPinos passou (${pinos.length} pinos encontrados)`);
}

// Executa todos os testes em sequência
(async () => {
  try {
    const pinoCriado = await pinoService.adicionarPino({
      nome: 'Pino Teste',
      msg: 'Mensagem de teste',
      capibas: 10,
      latitude: -8.05,
      longitude: -34.9
    });

    await testeAdicionarPino();
    await testeAtualizarPino(pinoCriado.pino._id);
    await testeDeletarPino(pinoCriado.pino._id);
    await testeGetPinos();
  } catch (err) {
    console.error('❌ Teste falhou:', err.message);
  }
})();
