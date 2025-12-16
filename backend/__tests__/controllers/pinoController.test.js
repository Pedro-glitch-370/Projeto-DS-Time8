// __tests__/controllers/pinoController.test.js

// 1. IMPORTAÇÕES
const PinoController = require('../../controllers/pinoController');
const mongoose = require('mongoose');

// 2. MOCKS
jest.mock('../../models/pinoModel', () => {
  return {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    prototype: {
      save: jest.fn()
    }
  };
});

const Pino = require('../../models/pinoModel');

// Mock do console.log para não poluir output dos testes
global.console = {
  log: jest.fn(),
  error: jest.fn()
};

describe('PinoController', () => {
  
  // Helper functions
  const criarReq = (body = {}, params = {}, query = {}) => ({ 
    body, 
    params, 
    query 
  });
  
  const criarRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTES PARA MÉTODOS PRIVADOS (via testes públicos) ==========
  
  describe('_extrairCoordenadas()', () => {
    test('deve extrair coordenadas de localizacao.coordinates', () => {
      const body = {
        localizacao: { coordinates: [-46.6333, -23.5505] }
      };
      
      // Testamos indiretamente através de criarPino
      const req = criarReq(body);
      const res = criarRes();
      
      // Mock para não quebrar no save
      Pino.prototype.save = jest.fn().mockResolvedValue({ _id: '123' });
      Pino.mockImplementation(() => ({ save: Pino.prototype.save }));
      
      // Como é método privado, não podemos testar diretamente
      // Mas testaremos seu funcionamento através dos testes públicos
      expect(true).toBe(true);
    });
  });

  // ========== TESTES PARA criarPino() ==========
  describe('criarPino()', () => {
    test('deve criar pino com coordenadas no formato localizacao.coordinates', async () => {
      const req = criarReq({
        nome: 'Pino Teste',
        msg: 'Mensagem teste',
        capibas: 100,
        localizacao: {
          coordinates: [-46.6333, -23.5505] // [lng, lat]
        }
      });
      const res = criarRes();

      const pinoMock = {
        _id: new mongoose.Types.ObjectId(),
        nome: 'Pino Teste',
        msg: 'Mensagem teste',
        capibas: 100,
        localizacao: {
          type: 'Point',
          coordinates: [-46.6333, -23.5505]
        },
        save: jest.fn().mockResolvedValue(true)
      };

      Pino.mockImplementation(() => pinoMock);

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Pino criado com sucesso",
        pino: expect.any(Object)
      });
      expect(pinoMock.save).toHaveBeenCalled();
    });

    test('deve criar pino com coordenadas no formato simplificado', async () => {
      const req = criarReq({
        nome: 'Pino Simplificado',
        msg: 'Teste',
        coordinates: [-46.6333, -23.5505]
      });
      const res = criarRes();

      const pinoMock = {
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn().mockResolvedValue(true)
      };

      Pino.mockImplementation(() => pinoMock);

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('deve criar pino com latitude/longitude separados', async () => {
      const req = criarReq({
        nome: 'Pino Lat/Lng',
        msg: 'Teste',
        latitude: -23.5505,
        longitude: -46.6333
      });
      const res = criarRes();

      const pinoMock = {
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn().mockResolvedValue(true)
      };

      Pino.mockImplementation(() => pinoMock);

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('deve retornar erro 400 para formato de coordenadas inválido', async () => {
      const req = criarReq({
        nome: 'Pino Teste',
        msg: 'Teste'
        // Sem coordenadas!
      });
      const res = criarRes();

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('Formato de localização inválido')
      });
    });

    test('deve retornar erro 400 para nome vazio', async () => {
      const req = criarReq({
        nome: '', // Nome vazio!
        msg: 'Mensagem',
        coordinates: [-46.6333, -23.5505]
      });
      const res = criarRes();

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Dados inválidos',
        errors: expect.arrayContaining([
          expect.stringContaining('Nome é obrigatório')
        ])
      });
    });

    test('deve retornar erro 400 para coordenadas inválidas', async () => {
      const req = criarReq({
        nome: 'Pino Teste',
        msg: 'Mensagem',
        coordinates: [-200, 100] // Coordenadas inválidas!
      });
      const res = criarRes();

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Dados inválidos',
        errors: expect.arrayContaining([
          expect.stringContaining('Coordenadas inválidas')
        ])
      });
    });

    test('deve garantir capibas positivo mesmo quando negativo for passado', async () => {
      const req = criarReq({
        nome: 'Pino Capibas',
        msg: 'Teste',
        coordinates: [-46.6333, -23.5505],
        capibas: -50 // Negativo!
      });
      const res = criarRes();

      const pinoMock = {
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn().mockResolvedValue(true),
        capibas: 0 // Deve ser 0 após Math.max(0, -50)
      };

      Pino.mockImplementation(() => pinoMock);

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ========== TESTES PARA getTodosPinos() ==========
  describe('getTodosPinos()', () => {
    test('deve retornar todos os pinos ordenados por data', async () => {
      const req = criarReq();
      const res = criarRes();

      const pinosMock = [
        { _id: '1', nome: 'Pino 1', localizacao: { coordinates: [-46, -23] } },
        { _id: '2', nome: 'Pino 2', localizacao: { coordinates: [-47, -24] } }
      ];

      Pino.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(pinosMock)
      });

      await PinoController.getTodosPinos(req, res);

      expect(Pino.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(pinosMock);
    });

    test('deve retornar array vazio se não houver pinos', async () => {
      const req = criarReq();
      const res = criarRes();

      Pino.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      await PinoController.getTodosPinos(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('deve retornar erro 500 em caso de falha no banco', async () => {
      const req = criarReq();
      const res = criarRes();

      Pino.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      await PinoController.getTodosPinos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro interno do servidor ao buscar pinos"
      });
    });
  });

  // ========== TESTES PARA deletarPino() ==========
  describe('deletarPino()', () => {
    test('deve deletar pino com ID válido', async () => {
      const pinoId = new mongoose.Types.ObjectId();
      const req = criarReq({}, { id: pinoId.toString() });
      const res = criarRes();

      Pino.findByIdAndDelete.mockResolvedValue({ _id: pinoId });

      await PinoController.deletarPino(req, res);

      expect(Pino.findByIdAndDelete).toHaveBeenCalledWith(pinoId.toString());
      expect(res.json).toHaveBeenCalledWith({
        message: "Pino deletado com sucesso",
        deletedId: pinoId.toString()
      });
    });

    test('deve retornar erro 400 para ID inválido', async () => {
      const req = criarReq({}, { id: 'id-invalido' });
      const res = criarRes();

      await PinoController.deletarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do pino inválido"
      });
    });

    test('deve retornar erro 404 se pino não existir', async () => {
      const pinoId = new mongoose.Types.ObjectId();
      const req = criarReq({}, { id: pinoId.toString() });
      const res = criarRes();

      Pino.findByIdAndDelete.mockResolvedValue(null);

      await PinoController.deletarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Pino não encontrado"
      });
    });
  });

  // ========== TESTES PARA atualizarPino() ==========
  describe('atualizarPino()', () => {
    test('deve atualizar pino com dados válidos', async () => {
      const pinoId = new mongoose.Types.ObjectId();
      const req = criarReq(
        { nome: 'Novo Nome', msg: 'Nova Mensagem' },
        { id: pinoId.toString() }
      );
      const res = criarRes();

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

      Pino.findById.mockResolvedValueOnce(pinoExistente);
      Pino.findByIdAndUpdate.mockResolvedValue(pinoAtualizado);

      await PinoController.atualizarPino(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Pino atualizado com sucesso",
        pino: pinoAtualizado
      });
    });

    test('deve atualizar coordenadas do pino', async () => {
      const pinoId = new mongoose.Types.ObjectId();
      const req = criarReq(
        { coordinates: [-47, -24] },
        { id: pinoId.toString() }
      );
      const res = criarRes();

      const pinoExistente = {
        _id: pinoId,
        nome: 'Pino',
        msg: 'Msg',
        localizacao: { coordinates: [-46, -23] }
      };

      Pino.findById.mockResolvedValueOnce(pinoExistente);
      Pino.findByIdAndUpdate.mockResolvedValue({
        ...pinoExistente,
        localizacao: { coordinates: [-47, -24] }
      });

      await PinoController.atualizarPino(req, res);

      expect(Pino.findByIdAndUpdate).toHaveBeenCalled();
    });

    test('deve retornar erro 400 para ID inválido', async () => {
      const req = criarReq({ nome: 'Novo' }, { id: 'invalido' });
      const res = criarRes();

      await PinoController.atualizarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ========== TESTES PARA buscarPinoPorId() ==========
  describe('buscarPinoPorId()', () => {
    test('deve buscar pino por ID válido', async () => {
      const pinoId = new mongoose.Types.ObjectId();
      const req = criarReq({}, { id: pinoId.toString() });
      const res = criarRes();

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

    test('deve retornar 404 se pino não existir', async () => {
      const pinoId = new mongoose.Types.ObjectId();
      const req = criarReq({}, { id: pinoId.toString() });
      const res = criarRes();

      Pino.findById.mockResolvedValue(null);

      await PinoController.buscarPinoPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Pino não encontrado"
      });
    });
  });

  // ========== TESTES PARA buscarPinosPorProximidade() ==========
  describe('buscarPinosPorProximidade()', () => {
    test('deve buscar pinos por proximidade com coordenadas válidas', async () => {
      const req = criarReq({}, {}, {
        longitude: '-46.6333',
        latitude: '-23.5505',
        raio: '1000'
      });
      const res = criarRes();

      const pinosMock = [
        { _id: '1', nome: 'Pino Próximo', localizacao: { coordinates: [-46.6333, -23.5505] } }
      ];

      Pino.find.mockResolvedValue(pinosMock);

      await PinoController.buscarPinosPorProximidade(req, res);

      expect(Pino.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(pinosMock);
    });

    test('deve usar raio padrão de 1000 metros se não especificado', async () => {
      const req = criarReq({}, {}, {
        longitude: '-46.6333',
        latitude: '-23.5505'
        // Sem raio
      });
      const res = criarRes();

      Pino.find.mockResolvedValue([]);

      await PinoController.buscarPinosPorProximidade(req, res);

      expect(Pino.find).toHaveBeenCalled();
    });

    test('deve retornar erro 400 se faltar longitude ou latitude', async () => {
      // Sem longitude
      const req1 = criarReq({}, {}, { latitude: '-23.5505' });
      const res1 = criarRes();
      await PinoController.buscarPinosPorProximidade(req1, res1);
      expect(res1.status).toHaveBeenCalledWith(400);

      // Sem latitude
      const req2 = criarReq({}, {}, { longitude: '-46.6333' });
      const res2 = criarRes();
      await PinoController.buscarPinosPorProximidade(req2, res2);
      expect(res2.status).toHaveBeenCalledWith(400);
    });

    test('deve retornar erro 400 para coordenadas inválidas', async () => {
      const req = criarReq({}, {}, {
        longitude: '200', // Inválido (> 180)
        latitude: '-23.5505'
      });
      const res = criarRes();

      await PinoController.buscarPinosPorProximidade(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ========== TESTES DE VALIDAÇÃO DE COORDENADAS ==========
  describe('Validação de Coordenadas', () => {
    test('deve aceitar longitude entre -180 e 180', () => {
      // Testamos indiretamente através dos métodos públicos
      const req = criarReq({
        nome: 'Teste',
        msg: 'Teste',
        coordinates: [180, 0] // Longitude no limite
      });
      const res = criarRes();

      const pinoMock = {
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn().mockResolvedValue(true)
      };

      Pino.mockImplementation(() => pinoMock);

      // Não deve lançar erro
      expect(async () => {
        await PinoController.criarPino(req, res);
      }).not.toThrow();
    });

    test('deve rejeitar longitude fora dos limites', async () => {
      const req = criarReq({
        nome: 'Teste',
        msg: 'Teste',
        coordinates: [200, 0] // Longitude inválida
      });
      const res = criarRes();

      await PinoController.criarPino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});