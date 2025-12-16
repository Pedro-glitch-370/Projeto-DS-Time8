// __tests__/controllers/validarLocalizacaoController.test.js - VERSÃO FUNCIONAL

// 1. MOCKS PRIMEIRO (DENTRO do jest.mock)
jest.mock('geolib', () => ({
  getDistance: jest.fn()
}));

jest.mock('../../models/pinoModel', () => ({
  findById: jest.fn(),
  find: jest.fn()
}));

// 2. DEPOIS importa tudo
const {
  validarProximidadePino,
  encontrarPinosProximos,
  validarProximidadeOtimizada
} = require('../../controllers/validarLocalizacaoController');

const geolib = require('geolib');
const Pino = require('../../models/pinoModel');

// 3. Mock do console
global.console.log = jest.fn();
global.console.error = jest.fn();
global.console.warn = jest.fn();

describe('validarLocalizacaoController', () => {
  
  // Helper functions
  const criarReq = (body = {}) => ({ body });
  
  const criarRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTES PARA validarProximidadePino ==========
  describe('validarProximidadePino()', () => {
    test('deve retornar true quando usuário está próximo do pino', async () => {
      const req = criarReq({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123',
        raioMaximo: 50
      });
      const res = criarRes();

      const pinoMock = {
        _id: 'pino123',
        nome: 'Pino Teste',
        localizacao: {
          coordinates: [-34.9286, -8.0522]
        },
        capibas: 100
      };

      geolib.getDistance.mockReturnValue(30);
      Pino.findById.mockResolvedValue(pinoMock);

      await validarProximidadePino(req, res);

      expect(Pino.findById).toHaveBeenCalledWith('pino123');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: true,
          message: "✅ Você está dentro da área permitida!"
        })
      );
    });

    test('deve retornar false quando usuário está longe do pino', async () => {
      const req = criarReq({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123',
        raioMaximo: 50
      });
      const res = criarRes();

      const pinoMock = {
        _id: 'pino123',
        nome: 'Pino Teste',
        localizacao: {
          coordinates: [-34.9386, -8.0622]
        }
      };

      geolib.getDistance.mockReturnValue(1500);
      Pino.findById.mockResolvedValue(pinoMock);

      await validarProximidadePino(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: false,
          message: expect.stringContaining("❌ Você está a 1500m do local")
        })
      );
    });

    test('deve retornar erro 400 quando faltam campos obrigatórios', async () => {
      const req = criarReq({
        longitudeUsuario: -34.9286,
        pinoId: 'pino123'
      });
      const res = criarRes();
      
      await validarProximidadePino(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deve retornar erro 400 para coordenadas inválidas (não números)', async () => {
      const req = criarReq({
        latitudeUsuario: 'abc',
        longitudeUsuario: '-34.9286',
        pinoId: 'pino123'
      });
      const res = criarRes();

      await validarProximidadePino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        valid: false,
        message: "Coordenadas devem ser números válidos."
      });
    });

    test('deve retornar erro 400 para coordenadas fora dos limites globais', async () => {
      const req = criarReq({
        latitudeUsuario: 100,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123'
      });
      const res = criarRes();
      
      await validarProximidadePino(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deve retornar erro 404 quando pino não é encontrado', async () => {
      const req = criarReq({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'naoexiste'
      });
      const res = criarRes();

      Pino.findById.mockResolvedValue(null);

      await validarProximidadePino(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        valid: false,
        message: "Pino não encontrado."
      });
    });

    test('deve converter corretamente coordenadas GeoJSON [lng, lat] para geolib', async () => {
      const req = criarReq({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123'
      });
      const res = criarRes();

      const pinoMock = {
        _id: 'pino123',
        nome: 'Pino Teste',
        localizacao: {
          coordinates: [-34.9386, -8.0622]
        }
      };

      geolib.getDistance.mockReturnValue(100);
      Pino.findById.mockResolvedValue(pinoMock);

      await validarProximidadePino(req, res);

      expect(geolib.getDistance).toHaveBeenCalledWith(
        { latitude: -8.0522, longitude: -34.9286 },
        { latitude: -8.0622, longitude: -34.9386 }
      );
    });

    test('deve usar raio padrão de 50m quando não especificado', async () => {
      const req = criarReq({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123'
      });
      const res = criarRes();

      const pinoMock = {
        _id: 'pino123',
        nome: 'Pino',
        localizacao: { coordinates: [-34.9286, -8.0522] }
      };

      geolib.getDistance.mockReturnValue(30);
      Pino.findById.mockResolvedValue(pinoMock);

      await validarProximidadePino(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: true,
          limites: expect.objectContaining({
            raioMaximoMetros: 50
          })
        })
      );
    });
  });

  // ========== TESTES PARA encontrarPinosProximos ==========
  describe('encontrarPinosProximos()', () => {
    test('deve encontrar pinos próximos dentro do raio', async () => {
      const req = criarReq({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 100,
        limite: 5
      });
      const res = criarRes();

      const pinosMock = [
        {
          _id: 'pino1',
          nome: 'Pino Próximo',
          msg: 'Mensagem 1',
          capibas: 50,
          localizacao: { coordinates: [-34.9286, -8.0522] }
        },
        {
          _id: 'pino2',
          nome: 'Pino Longe',
          msg: 'Mensagem 2',
          capibas: 100,
          localizacao: { coordinates: [-35.0000, -8.1000] }
        }
      ];

      geolib.getDistance
        .mockReturnValueOnce(30)
        .mockReturnValueOnce(2000);

      Pino.find.mockResolvedValue(pinosMock);

      await encontrarPinosProximos(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        totalPinos: 2,
        pinosProximos: [
          expect.objectContaining({
            id: 'pino1',
            nome: 'Pino Próximo',
            estaProximo: true,
            distancia: expect.objectContaining({
              metros: 30
            })
          })
        ],
        pinosEncontrados: 1,
        localizacaoUsuario: { latitude: -8.0522, longitude: -34.9286 },
        raioBusca: 100
      });
    });

    test('deve retornar array vazio se não houver pinos próximos', async () => {
      const req = criarReq({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 50
      });
      const res = criarRes();

      const pinosMock = [
        {
          _id: 'pino1',
          nome: 'Pino Longe',
          localizacao: { coordinates: [-35.0000, -8.1000] }
        }
      ];

      geolib.getDistance.mockReturnValue(2000);
      Pino.find.mockResolvedValue(pinosMock);

      await encontrarPinosProximos(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          pinosProximos: [],
          pinosEncontrados: 0
        })
      );
    });
  });

  // ========== TESTES PARA validarProximidadeOtimizada ==========
  describe('validarProximidadeOtimizada()', () => {
    test('deve usar consulta geoespacial do MongoDB + geolib', async () => {
      const req = criarReq({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 100
      });
      const res = criarRes();

      const pinosMock = [
        {
          _id: 'pino1',
          nome: 'Pino Próximo',
          msg: 'Mensagem',
          capibas: 50,
          localizacao: { coordinates: [-34.9286, -8.0522] }
        }
      ];

      Pino.find.mockResolvedValue(pinosMock);
      geolib.getDistance.mockReturnValue(30);

      await validarProximidadeOtimizada(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: true,
          calculadoCom: "MongoDB + geolib",
          totalEncontrados: 1
        })
      );
    });

    test('deve retornar false quando não encontra pinos próximos', async () => {
      const req = criarReq({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 50
      });
      const res = criarRes();

      Pino.find.mockResolvedValue([]);

      await validarProximidadeOtimizada(req, res);

      expect(res.json).toHaveBeenCalledWith({
        valid: false,
        message: "📍 Nenhum pino encontrado próximo a você.",
        pinos: [],
        totalEncontrados: 0,
        localizacaoUsuario: { latitude: -8.0522, longitude: -34.9286 },
        calculadoCom: "MongoDB + geolib"
      });
    });
  });

  // ========== TESTES DE ERRO ==========
  describe('Tratamento de erros', () => {
    test('deve retornar erro 500 quando geolib.getDistance falha', async () => {
      const req = criarReq({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123'
      });
      const res = criarRes();

      const pinoMock = {
        _id: 'pino123',
        nome: 'Pino',
        localizacao: { coordinates: [-34.9286, -8.0522] }
      };

      Pino.findById.mockResolvedValue(pinoMock);
      geolib.getDistance.mockImplementation(() => {
        throw new Error('Erro no geolib');
      });

      await validarProximidadePino(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: false,
          message: "Erro interno no servidor durante validação."
        })
      );
    });

    test('deve retornar erro 500 quando banco de dados falha', async () => {
      const req = criarReq({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123'
      });
      const res = criarRes();

      Pino.findById.mockRejectedValue(new Error('Database error'));

      await validarProximidadePino(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});