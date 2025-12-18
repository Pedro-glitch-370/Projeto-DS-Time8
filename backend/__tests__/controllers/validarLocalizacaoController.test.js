// __tests__/controllers/validarLocalizacaoController.test.js
const geolib = require('geolib');
const {
  validarProximidadePino,
  encontrarPinosProximos,
  validarProximidadeOtimizada
} = require('../../controllers/validarLocalizacaoController');

// Mock completo dos módulos
jest.mock('geolib', () => ({
  getDistance: jest.fn()
}));

jest.mock('../../models/pinoModel', () => {
  const mockPino = {
    _id: 'pino123',
    nome: 'Pino Teste',
    msg: 'Mensagem teste',
    capibas: 100,
    localizacao: {
      type: 'Point',
      coordinates: [-34.9286, -8.0522] // [lng, lat]
    }
  };

  return {
    __esModule: true,
    findById: jest.fn(),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis()
    })
  };
});

const Pino = require('../../models/pinoModel');

// Suprimir logs durante testes
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  console.warn.mockRestore();
});

// Helper functions
const mockRequest = (body = {}) => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('📍 validarLocalizacaoController - Testes Unitários Completos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== VALIDAR PROXIMIDADE PINO ====================
  describe('🔍 validarProximidadePino()', () => {
    it('deve retornar true quando usuário está dentro do raio permitido', async () => {
      // Arrange
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123',
        raioMaximo: 50
      });
      const res = mockResponse();

      const pinoMock = {
        _id: 'pino123',
        nome: 'Pino Central',
        localizacao: {
          coordinates: [-34.9286, -8.0522] // Mesmas coordenadas
        },
        capibas: 100
      };

      Pino.findById.mockResolvedValue(pinoMock);
      geolib.getDistance.mockReturnValue(30); // Dentro do raio de 50m

      // Act
      await validarProximidadePino(req, res);

      // Assert
      expect(Pino.findById).toHaveBeenCalledWith('pino123');
      expect(geolib.getDistance).toHaveBeenCalledWith(
        { latitude: -8.0522, longitude: -34.9286 },
        { latitude: -8.0522, longitude: -34.9286 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: true,
          message: '✅ Você está dentro da área permitida!',
          distancia: expect.objectContaining({
            metros: 30,
            quilometros: '0.030'
          })
        })
      );
    });

    it('deve retornar false quando usuário está fora do raio permitido', async () => {
      // Arrange
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123',
        raioMaximo: 50
      });
      const res = mockResponse();

      const pinoMock = {
        _id: 'pino123',
        nome: 'Pino Distante',
        localizacao: {
          coordinates: [-34.9386, -8.0622] // Coordenadas diferentes
        }
      };

      Pino.findById.mockResolvedValue(pinoMock);
      geolib.getDistance.mockReturnValue(1500); // Fora do raio

      // Act
      await validarProximidadePino(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          valid: false,
          message: expect.stringContaining('❌ Você está a 1500m do local. Aproxime-se!')
        })
      );
    });

    it('deve retornar erro 400 quando faltam campos obrigatórios', async () => {
      const testCases = [
        { 
          body: { longitudeUsuario: -34.9286, pinoId: 'pino123' },
          expectedError: 'Coordenadas e ID do pino são obrigatórios.'
        },
        { 
          body: { latitudeUsuario: -8.0522, pinoId: 'pino123' },
          expectedError: 'Coordenadas e ID do pino são obrigatórios.'
        },
        { 
          body: { latitudeUsuario: -8.0522, longitudeUsuario: -34.9286 },
          expectedError: 'Coordenadas e ID do pino são obrigatórios.'
        }
      ];

      for (const testCase of testCases) {
        const req = mockRequest(testCase.body);
        const res = mockResponse();

        await validarProximidadePino(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          valid: false,
          message: testCase.expectedError
        });
      }
    });

    it('deve retornar erro 400 para coordenadas não numéricas', async () => {
      const req = mockRequest({
        latitudeUsuario: 'abc',
        longitudeUsuario: 'xyz',
        pinoId: 'pino123'
      });
      const res = mockResponse();

      await validarProximidadePino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        valid: false,
        message: 'Coordenadas devem ser números válidos.'
      });
    });

    it('deve retornar erro 400 para coordenadas fora dos limites globais', async () => {
      const testCases = [
        { lat: 100, lng: 0, error: 'Coordenadas fora dos intervalos válidos' },
        { lat: -100, lng: 0, error: 'Coordenadas fora dos intervalos válidos' },
        { lat: 0, lng: 200, error: 'Coordenadas fora dos intervalos válidos' },
        { lat: 0, lng: -200, error: 'Coordenadas fora dos intervalos válidos' }
      ];

      for (const testCase of testCases) {
        const req = mockRequest({
          latitudeUsuario: testCase.lat,
          longitudeUsuario: testCase.lng,
          pinoId: 'pino123'
        });
        const res = mockResponse();

        await validarProximidadePino(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          valid: false,
          message: expect.stringContaining(testCase.error)
        });
      }
    });

    it('deve retornar erro 404 quando pino não existe', async () => {
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'naoexiste'
      });
      const res = mockResponse();

      Pino.findById.mockResolvedValue(null);

      await validarProximidadePino(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        valid: false,
        message: 'Pino não encontrado.'
      });
    });

    it('deve usar raio padrão de 50 metros quando não especificado', async () => {
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123'
      });
      const res = mockResponse();

      const pinoMock = {
        _id: 'pino123',
        nome: 'Pino',
        localizacao: { coordinates: [-34.9286, -8.0522] }
      };

      Pino.findById.mockResolvedValue(pinoMock);
      geolib.getDistance.mockReturnValue(30);

      await validarProximidadePino(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          limites: expect.objectContaining({
            raioMaximoMetros: 50,
            raioMaximoKm: '0.1'
          })
        })
      );
    });

    it('deve converter corretamente coordenadas GeoJSON [lng, lat] para geolib {lat, lng}', async () => {
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123'
      });
      const res = mockResponse();

      const pinoMock = {
        _id: 'pino123',
        nome: 'Pino Teste',
        localizacao: {
          coordinates: [-34.9386, -8.0622] // [lng, lat]
        }
      };

      Pino.findById.mockResolvedValue(pinoMock);
      geolib.getDistance.mockReturnValue(100);

      await validarProximidadePino(req, res);

      // Verifica que a conversão está correta
      expect(geolib.getDistance).toHaveBeenCalledWith(
        { latitude: -8.0522, longitude: -34.9286 },
        { latitude: -8.0622, longitude: -34.9386 } // Convertido corretamente
      );
    });

    it('deve retornar interpretação humana da distância', async () => {
      const testCases = [
        { distancia: 5, expected: 'Muito próximo' },
        { distancia: 30, expected: 'Próximo' },
        { distancia: 80, expected: 'Perto' },
        { distancia: 300, expected: 'Um pouco longe' },
        { distancia: 800, expected: 'Longe' },
        { distancia: 1500, expected: 'Muito longe' }
      ];

      for (const testCase of testCases) {
        const req = mockRequest({
          latitudeUsuario: -8.0522,
          longitudeUsuario: -34.9286,
          pinoId: 'pino123'
        });
        const res = mockResponse();

        const pinoMock = {
          _id: 'pino123',
          nome: 'Pino',
          localizacao: { coordinates: [-34.9286, -8.0522] }
        };

        Pino.findById.mockResolvedValue(pinoMock);
        geolib.getDistance.mockReturnValue(testCase.distancia);

        await validarProximidadePino(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            distancia: expect.objectContaining({
              interpretacao: testCase.expected
            })
          })
        );
      }
    });

    it('deve tratar erro interno do servidor (geolib)', async () => {
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        pinoId: 'pino123'
      });
      const res = mockResponse();

      const pinoMock = {
        _id: 'pino123',
        nome: 'Pino',
        localizacao: { coordinates: [-34.9286, -8.0522] }
      };

      Pino.findById.mockResolvedValue(pinoMock);
      geolib.getDistance.mockImplementation(() => {
        throw new Error('Erro no cálculo da distância');
      });

      await validarProximidadePino(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        valid: false,
        message: 'Erro interno no servidor durante validação.',
        detalhes: undefined
      });
    });
  });

  // ==================== ENCONTRAR PINOS PRÓXIMOS ====================
  describe('🔎 encontrarPinosProximos()', () => {
    it('deve encontrar pinos dentro do raio e ordenar por distância', async () => {
      // Arrange
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 100,
        limite: 5
      });
      const res = mockResponse();

      const pinosMock = [
        {
          _id: 'pino1',
          nome: 'Pino Próximo 1',
          msg: 'Mensagem 1',
          capibas: 50,
          localizacao: { coordinates: [-34.9286, -8.0522] }
        },
        {
          _id: 'pino2',
          nome: 'Pino Próximo 2',
          msg: 'Mensagem 2',
          capibas: 100,
          localizacao: { coordinates: [-34.9296, -8.0532] }
        },
        {
          _id: 'pino3',
          nome: 'Pino Longe',
          msg: 'Mensagem 3',
          capibas: 150,
          localizacao: { coordinates: [-35.0000, -8.1000] }
        }
      ];

      Pino.find.mockResolvedValue(pinosMock);
      geolib.getDistance
        .mockReturnValueOnce(0)   // pino1: 0m
        .mockReturnValueOnce(50)  // pino2: 50m
        .mockReturnValueOnce(5000); // pino3: 5000m

      // Act
      await encontrarPinosProximos(req, res);

      // Assert
      expect(Pino.find).toHaveBeenCalledWith({});
      expect(geolib.getDistance).toHaveBeenCalledTimes(3);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        totalPinos: 3,
        pinosProximos: [
          expect.objectContaining({
            id: 'pino1',
            nome: 'Pino Próximo 1',
            estaProximo: true,
            distancia: expect.objectContaining({ metros: 0 })
          }),
          expect.objectContaining({
            id: 'pino2',
            nome: 'Pino Próximo 2',
            estaProximo: true,
            distancia: expect.objectContaining({ metros: 50 })
          })
        ],
        pinosEncontrados: 2,
        localizacaoUsuario: { latitude: -8.0522, longitude: -34.9286 },
        raioBusca: 100
      });
    });

    it('deve retornar array vazio quando não há pinos próximos', async () => {
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 50
      });
      const res = mockResponse();

      const pinosMock = [
        {
          _id: 'pino1',
          nome: 'Pino Longe',
          localizacao: { coordinates: [-35.0000, -8.1000] }
        }
      ];

      Pino.find.mockResolvedValue(pinosMock);
      geolib.getDistance.mockReturnValue(2000); // Fora do raio

      await encontrarPinosProximos(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        totalPinos: 1,
        pinosProximos: [],
        pinosEncontrados: 0,
        localizacaoUsuario: { latitude: -8.0522, longitude: -34.9286 },
        raioBusca: 50
      });
    });

    it('deve usar limite padrão de 10 quando não especificado', async () => {
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 100
      });
      const res = mockResponse();

      const pinosMock = [
        {
          _id: 'pino1',
          nome: 'Pino Próximo',
          localizacao: { coordinates: [-34.9286, -8.0522] }
        },
        {
          _id: 'pino2',
          nome: 'Pino Próximo 2',
          localizacao: { coordinates: [-34.9296, -8.0532] }
        }
      ];

      Pino.find.mockResolvedValue(pinosMock);
      geolib.getDistance
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(50);

      await encontrarPinosProximos(req, res);

      // Verifica que retornou ambos os pinos (dentro do limite padrão 10)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pinosProximos: expect.arrayContaining([
            expect.objectContaining({ id: 'pino1' }),
            expect.objectContaining({ id: 'pino2' })
          ]),
          pinosEncontrados: 2
        })
      );
    });

    it('deve retornar erro 400 para coordenadas inválidas', async () => {
      const req = mockRequest({
        latitudeUsuario: 'abc',
        longitudeUsuario: 'def',
        raioMaximo: 50
      });
      const res = mockResponse();

      await encontrarPinosProximos(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Coordenadas inválidas.'
      });
    });

    it('deve tratar erro interno do servidor', async () => {
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 100
      });
      const res = mockResponse();

      Pino.find.mockRejectedValue(new Error('Erro de banco'));

      await encontrarPinosProximos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erro ao buscar pinos próximos.'
      });
    });
  });

  // ==================== VALIDAR PROXIMIDADE OTIMIZADA ====================
  describe('⚡ validarProximidadeOtimizada()', () => {
    it('deve usar consulta geoespacial do MongoDB e calcular distância com geolib', async () => {
      // Arrange
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 100
      });
      const res = mockResponse();

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

      // Act
      await validarProximidadeOtimizada(req, res);

      // Assert
      expect(Pino.find).toHaveBeenCalledWith({
        localizacao: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [-34.9286, -8.0522] // [lng, lat]
            },
            $maxDistance: 100
          }
        }
      });
      expect(res.json).toHaveBeenCalledWith({
        valid: true,
        message: '🎯 Encontrado(s) 1 pino(s) próximo(s)!',
        pinos: [
          expect.objectContaining({
            id: 'pino1',
            nome: 'Pino Próximo',
            estaProximo: true,
            distancia: expect.objectContaining({
              metros: 30,
              km: '0.030'
            })
          })
        ],
        totalEncontrados: 1,
        localizacaoUsuario: { latitude: -8.0522, longitude: -34.9286 },
        calculadoCom: 'MongoDB + geolib'
      });
    });

    it('deve retornar false quando não encontra pinos próximos', async () => {
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 50
      });
      const res = mockResponse();

      Pino.find.mockResolvedValue([]);

      await validarProximidadeOtimizada(req, res);

      expect(res.json).toHaveBeenCalledWith({
        valid: false,
        message: '📍 Nenhum pino encontrado próximo a você.',
        pinos: [],
        totalEncontrados: 0,
        localizacaoUsuario: { latitude: -8.0522, longitude: -34.9286 },
        calculadoCom: 'MongoDB + geolib'
      });
    });

    it('deve usar raio padrão de 100 metros quando não especificado', async () => {
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286
      });
      const res = mockResponse();

      const pinosMock = [{
        _id: 'pino1',
        nome: 'Pino',
        localizacao: { coordinates: [-34.9286, -8.0522] }
      }];

      Pino.find.mockResolvedValue(pinosMock);
      geolib.getDistance.mockReturnValue(30);

      await validarProximidadeOtimizada(req, res);

      expect(Pino.find).toHaveBeenCalledWith({
        localizacao: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [-34.9286, -8.0522]
            },
            $maxDistance: 100 // Raio padrão
          }
        }
      });
    });

    it('deve retornar erro 400 para coordenadas inválidas', async () => {
      const req = mockRequest({
        latitudeUsuario: 'abc',
        longitudeUsuario: 'def'
      });
      const res = mockResponse();

      await validarProximidadeOtimizada(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        valid: false,
        message: 'Coordenadas devem ser números válidos.'
      });
    });

    it('deve tratar erro interno do servidor', async () => {
      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 100
      });
      const res = mockResponse();

      Pino.find.mockRejectedValue(new Error('Erro de banco'));

      await validarProximidadeOtimizada(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        valid: false,
        message: 'Erro interno no servidor.'
      });
    });
  });

  // ==================== TESTES DE PERFORMANCE ====================
  describe('📊 Testes de Performance e Limites', () => {
    it('deve lidar com muitos pinos na busca de proximidade', async () => {
      // Simula 1000 pinos
      const muitosPinos = Array.from({ length: 1000 }, (_, i) => ({
        _id: `pino${i}`,
        nome: `Pino ${i}`,
        msg: `Mensagem ${i}`,
        capibas: i * 10,
        localizacao: { 
          coordinates: [
            -34.9286 + (Math.random() * 0.02 - 0.01), // Variação pequena
            -8.0522 + (Math.random() * 0.02 - 0.01)
          ]
        }
      }));

      const req = mockRequest({
        latitudeUsuario: -8.0522,
        longitudeUsuario: -34.9286,
        raioMaximo: 1000,
        limite: 20
      });
      const res = mockResponse();

      Pino.find.mockResolvedValue(muitosPinos);
      geolib.getDistance.mockReturnValue(500); // Todos a 500m

      await encontrarPinosProximos(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          totalPinos: 1000,
          pinosProximos: expect.any(Array),
          pinosEncontrados: expect.any(Number)
        })
      );
    });

    it('deve converter coordenadas extremas corretamente', async () => {
      const testCases = [
        { lat: 90, lng: 180 },   // Extremo nordeste
        { lat: -90, lng: -180 }, // Extremo sudoeste
        { lat: 0, lng: 0 },      // Centro
        { lat: 45.5, lng: -122.5 } // Coordenadas reais
      ];

      for (const testCase of testCases) {
        const req = mockRequest({
          latitudeUsuario: testCase.lat,
          longitudeUsuario: testCase.lng,
          pinoId: 'pino123'
        });
        const res = mockResponse();

        const pinoMock = {
          _id: 'pino123',
          nome: 'Pino',
          localizacao: { coordinates: [testCase.lng, testCase.lat] }
        };

        Pino.findById.mockResolvedValue(pinoMock);
        geolib.getDistance.mockReturnValue(0);

        await validarProximidadePino(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
      }
    });
  });
});