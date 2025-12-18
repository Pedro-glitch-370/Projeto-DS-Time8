// __tests__/controllers/pinoController.test.js

const PinoController = require('../../controllers/pinoController');

// 2. MOCKS - CORRIGIDO (sem mongoose dentro do jest.mock)
jest.mock('../../models/pinoModel', () => {
  // Função para gerar um ID fake sem usar mongoose
  const generateMockId = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const randomValue = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => 
      Math.floor(Math.random() * 16).toString(16)
    );
    return timestamp + randomValue;
  };

  const mockId = generateMockId();
  
  const mockPinoInstance = {
    _id: mockId,
    nome: '',
    msg: '',
    capibas: 0,
    localizacao: { type: 'Point', coordinates: [0, 0] },
    createdAt: new Date(),
    save: jest.fn().mockResolvedValue(true)
  };

  return {
    __esModule: true,
    default: jest.fn(() => mockPinoInstance),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis()
    }),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn()
  };
});

const Pino = require('../../models/pinoModel');

// 3. IMPORT mongoose APENAS fora do jest.mock()
const mongoose = require('mongoose');

// 4. Mock do console
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

// 5. Helper functions
const mockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// 6. TESTES
describe('📍 PinoController - Testes Unitários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('📝 criarPino()', () => {
    it('deve criar pino com formato localizacao.coordinates (GeoJSON)', async () => {
      const pinoData = {
        nome: 'Praça Central',
        msg: 'Ponto de encontro da cidade',
        capibas: 100,
        localizacao: {
          coordinates: [-46.6333, -23.5505]
        }
      };

      const req = mockRequest(pinoData);
      const res = mockResponse();

      const mockPinoSalvo = {
        _id: new mongoose.Types.ObjectId(),
        ...pinoData,
        localizacao: {
          type: 'Point',
          coordinates: pinoData.localizacao.coordinates
        },
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock do construtor
      Pino.mockImplementation(() => mockPinoSalvo);

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Pino criado com sucesso',
        pino: expect.any(Object)
      });
    });

    it('deve criar pino com formato coordinates simplificado', async () => {
      const req = mockRequest({
        nome: 'Pino Simplificado',
        msg: 'Teste',
        coordinates: [-46.6333, -23.5505]
      });
      const res = mockResponse();

      const mockPino = {
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn().mockResolvedValue(true)
      };

      Pino.mockImplementation(() => mockPino);

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar erro 400 para formato de localização inválido', async () => {
      const req = mockRequest({
        nome: 'Pino Sem Coordenadas',
        msg: 'Teste'
      });
      const res = mockResponse();

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar erro 400 para nome vazio', async () => {
      const req = mockRequest({
        nome: '',
        msg: 'Mensagem',
        coordinates: [-46.6333, -23.5505]
      });
      const res = mockResponse();

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar erro 400 para coordenadas inválidas', async () => {
      const req = mockRequest({
        nome: 'Pino Teste',
        msg: 'Mensagem',
        coordinates: [-200, 100]
      });
      const res = mockResponse();

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('📋 getTodosPinos()', () => {
    it('deve retornar todos os pinos ordenados por data', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const pinosMock = [
        { _id: new mongoose.Types.ObjectId(), nome: 'Pino 1', localizacao: { coordinates: [-46, -23] } },
        { _id: new mongoose.Types.ObjectId(), nome: 'Pino 2', localizacao: { coordinates: [-47, -24] } }
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(pinosMock)
      };
      Pino.find.mockReturnValue(mockQuery);

      await PinoController.getTodosPinos(req, res);

      expect(Pino.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(pinosMock);
    });

    it('deve retornar array vazio se não houver pinos', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockQuery = {
        sort: jest.fn().mockResolvedValue([])
      };
      Pino.find.mockReturnValue(mockQuery);

      await PinoController.getTodosPinos(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('🗑️ deletarPino()', () => {
    const pinoId = new mongoose.Types.ObjectId();

    it('deve deletar pino com ID válido', async () => {
      const req = mockRequest({}, { id: pinoId.toString() });
      const res = mockResponse();

      Pino.findByIdAndDelete.mockResolvedValue({ _id: pinoId });

      await PinoController.deletarPino(req, res);

      expect(Pino.findByIdAndDelete).toHaveBeenCalledWith(pinoId.toString());
      expect(res.json).toHaveBeenCalledWith({
        message: 'Pino deletado com sucesso',
        deletedId: pinoId.toString()
      });
    });

    it('deve retornar erro 400 para ID inválido', async () => {
      const req = mockRequest({}, { id: 'id-invalido' });
      const res = mockResponse();

      await PinoController.deletarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar erro 404 se pino não existir', async () => {
      const req = mockRequest({}, { id: pinoId.toString() });
      const res = mockResponse();

      Pino.findByIdAndDelete.mockResolvedValue(null);

      await PinoController.deletarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('✏️ atualizarPino()', () => {
    const pinoId = new mongoose.Types.ObjectId();

    it('deve atualizar pino com dados válidos', async () => {
      const pinoExistente = {
        _id: pinoId,
        nome: 'Nome Antigo',
        msg: 'Mensagem Antiga',
        localizacao: { coordinates: [-46, -23] }
      };

      const pinoAtualizado = {
        ...pinoExistente,
        nome: 'Novo Nome',
        msg: 'Nova Mensagem'
      };

      const req = mockRequest(
        { nome: 'Novo Nome', msg: 'Nova Mensagem' },
        { id: pinoId.toString() }
      );
      const res = mockResponse();

      Pino.findById.mockResolvedValueOnce(pinoExistente);
      Pino.findByIdAndUpdate.mockResolvedValue(pinoAtualizado);

      await PinoController.atualizarPino(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Pino atualizado com sucesso',
        pino: pinoAtualizado
      });
    });

    it('deve retornar erro 400 para ID inválido', async () => {
      const req = mockRequest({ nome: 'Novo' }, { id: 'invalido' });
      const res = mockResponse();

      await PinoController.atualizarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('🔍 buscarPinoPorId()', () => {
    const pinoId = new mongoose.Types.ObjectId();

    it('deve buscar pino por ID válido', async () => {
      const req = mockRequest({}, { id: pinoId.toString() });
      const res = mockResponse();

      const pinoMock = {
        _id: pinoId,
        nome: 'Pino Teste',
        localizacao: { coordinates: [-46, -23] }
      };

      Pino.findById.mockResolvedValue(pinoMock);

      await PinoController.buscarPinoPorId(req, res);

      expect(Pino.findById).toHaveBeenCalledWith(pinoId.toString());
      expect(res.json).toHaveBeenCalledWith(pinoMock);
    });

    it('deve retornar 404 se pino não existir', async () => {
      const req = mockRequest({}, { id: pinoId.toString() });
      const res = mockResponse();

      Pino.findById.mockResolvedValue(null);

      await PinoController.buscarPinoPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('📍 buscarPinosPorProximidade()', () => {
    it('deve buscar pinos por proximidade com coordenadas válidas', async () => {
      const req = mockRequest({}, {}, {
        longitude: '-46.6333',
        latitude: '-23.5505',
        raio: '1000'
      });
      const res = mockResponse();

      const pinosMock = [
        { _id: new mongoose.Types.ObjectId(), nome: 'Pino Próximo', localizacao: { coordinates: [-46.6333, -23.5505] } }
      ];

      Pino.find.mockResolvedValue(pinosMock);

      await PinoController.buscarPinosPorProximidade(req, res);

      expect(Pino.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(pinosMock);
    });

    it('deve retornar erro 400 se faltar longitude ou latitude', async () => {
      const req = mockRequest({}, {}, { latitude: '-23.5505' });
      const res = mockResponse();

      await PinoController.buscarPinosPorProximidade(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});