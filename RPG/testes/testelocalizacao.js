import assert from 'assert';
import { localizacaoService } from '../src/services/localizacaoService.js';

// Mock global fetch para testar
globalThis.fetch = async (url) => {
  if (url === 'https://ipapi.co/json/') {
    return {
      async json() {
        return { latitude: -8.05, longitude: -34.9, city: 'Recife', region: 'PE' };
      }
    };
  }
  throw new Error("Falha no fetch");
};

// Teste para coordenadas dentro e fora de Recife
async function testeValidarCoordenadasRecife() {
  assert.strictEqual(localizacaoService.validarCoordenadasRecife(-8.05, -34.9), true, 'Dentro de Recife deve ser válido');
  assert.strictEqual(localizacaoService.validarCoordenadasRecife(-10, -40), false, 'Fora de Recife deve ser inválido');
  console.log('✅ Teste validarCoordenadasRecife passou');
}

// Teste para obter localização por IP
async function testeObterLocalizacaoPorIP() {
  const loc = await localizacaoService.obterLocalizacaoPorIP();
  assert.strictEqual(loc.metodo, 'ip_fallback');
  assert.strictEqual(loc.latitude, -8.05);
  console.log('✅ Teste obterLocalizacaoPorIP passou');
}

// Teste para falhar na obtenção da localização por IP
async function testeObterLocalizacaoPorIPFalha() {
  // Mock fetch para falhar
  globalThis.fetch = async () => { throw new Error("Falha simulada"); };
  try {
    await localizacaoService.obterLocalizacaoPorIP();
    assert.fail('Deveria lançar erro');
  } catch (err) {
    assert.ok(err.message.includes("Não foi possível obter localização por IP"));
    console.log('✅ Teste obterLocalizacaoPorIPFalha passou');
  }
}

// Executa todos os testes
(async () => {
  try {
    await testeValidarCoordenadasRecife();
    await testeObterLocalizacaoPorIP();
    await testeObterLocalizacaoPorIPFalha();
  } catch (err) {
    console.error('❌ Teste falhou:', err.message);
  }
})();
