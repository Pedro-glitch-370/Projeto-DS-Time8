// __tests__/controllers/clienteController.test.js

// 1. IMPORTAÇÕES - NÃO importe mongoose aqui (dentro do jest.mock)
const ClienteController = require('../../controllers/clienteController');

// 2. MOCK DO MODEL - CORRIGIDO (sem referências externas)
jest.mock('../../models/clienteModel', () => {
  // Criar um ObjectId manualmente (sem usar mongoose)
  const mockObjectId = () => {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const random = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => 
      Math.floor(Math.random() * 16).toString(16)
    );
    return timestamp + random;
  };

  const mockId = mockObjectId();
  
  const mockClienteInstance = {
    _id: mockId,
    nome: '',
    email: '',
    senha: '',
    tipo: 'cliente',
    capibas: 0,
    tarefasCompletas: 0,
    tarefasConcluidas: [],
    save: jest.fn().mockResolvedValue(true)
  };

  return {
    __esModule: true,
    default: jest.fn(() => mockClienteInstance),
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndDelete: jest.fn()
  };
});

const Cliente = require('../../models/clienteModel');

// 3. IMPORTE mongoose APENAS para criar ObjectIds nos testes
const mongoose = require('mongoose');

// 4. Suprimir logs
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

// 5. Funções helper
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
describe('🧪 ClienteController - Testes Unitários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('📝 registrarCliente()', () => {
    it('deve registrar cliente com dados válidos', async () => {
      // Arrange
      const clienteData = {
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: 'senha123'
      };

      const req = mockRequest(clienteData);
      const res = mockResponse();

      // Mock: cliente não existe
      Cliente.findOne.mockResolvedValue(null);

      // Mock do cliente salvo
      const mockClienteSalvo = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...clienteData,
        tipo: 'cliente',
        capibas: 0,
        tarefasCompletas: 0,
        tarefasConcluidas: [],
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock do constructor
      const MockCliente = jest.fn().mockImplementation(() => mockClienteSalvo);
      Cliente.mockImplementation(MockCliente);

      // Act
      await ClienteController.registrarCliente(req, res);

      // Assert
      expect(Cliente.findOne).toHaveBeenCalledWith({ email: clienteData.email });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cliente registrado com sucesso',
        user: expect.objectContaining({
          nome: clienteData.nome,
          email: clienteData.email,
          tipo: 'cliente',
          capibas: 0
        })
      });
    });

    it('deve retornar erro 400 se faltar campo obrigatório', async () => {
      const testCases = [
        { data: { email: 'teste@teste.com', senha: '123' }, expectedError: 'Nome, email e senha são obrigatórios' },
        { data: { nome: 'Teste', senha: '123' }, expectedError: 'Nome, email e senha são obrigatórios' },
        { data: { nome: 'Teste', email: 'teste@teste.com' }, expectedError: 'Nome, email e senha são obrigatórios' }
      ];

      for (const testCase of testCases) {
        const req = mockRequest(testCase.data);
        const res = mockResponse();

        await ClienteController.registrarCliente(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: testCase.expectedError
        });
      }
    });

    it('deve retornar erro 400 se cliente já existir', async () => {
      const clienteData = {
        nome: 'Maria',
        email: 'existente@email.com',
        senha: '123456'
      };

      const req = mockRequest(clienteData);
      const res = mockResponse();

      // Mock: cliente já existe
      Cliente.findOne.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        ...clienteData
      });

      await ClienteController.registrarCliente(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cliente já existe com este email'
      });
    });

    it('deve tratar erro interno do servidor', async () => {
      const req = mockRequest({
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123'
      });
      const res = mockResponse();

      Cliente.findOne.mockRejectedValue(new Error('Erro de banco'));

      await ClienteController.registrarCliente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('🔐 loginCliente()', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const credentials = {
        email: 'cliente@email.com',
        senha: 'senha123'
      };

      const mockCliente = {
        _id: new mongoose.Types.ObjectId(),
        nome: 'Cliente Teste',
        email: credentials.email,
        senha: credentials.senha,
        tipo: 'cliente',
        capibas: 150,
        tarefasCompletas: 3,
        tarefasConcluidas: ['tarefa1', 'tarefa2']
      };

      const req = mockRequest(credentials);
      const res = mockResponse();

      Cliente.findOne.mockResolvedValue(mockCliente);

      await ClienteController.loginCliente(req, res);

      expect(Cliente.findOne).toHaveBeenCalledWith({ email: credentials.email });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login realizado com sucesso',
        user: expect.objectContaining({
          email: credentials.email,
          tipo: 'cliente'
        })
      });
    });

    it('deve retornar erro 400 se email ou senha não forem fornecidos', async () => {
      const testCases = [
        { data: { email: 'teste@teste.com' }, expectedError: 'Email e senha são obrigatórios' },
        { data: { senha: '123' }, expectedError: 'Email e senha são obrigatórios' },
        { data: {}, expectedError: 'Email e senha são obrigatórios' }
      ];

      for (const testCase of testCases) {
        const req = mockRequest(testCase.data);
        const res = mockResponse();

        await ClienteController.loginCliente(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: testCase.expectedError
        });
      }
    });

    it('deve retornar erro 400 se cliente não existir', async () => {
      const req = mockRequest({ 
        email: 'naoexiste@teste.com', 
        senha: '123' 
      });
      const res = mockResponse();

      Cliente.findOne.mockResolvedValue(null);

      await ClienteController.loginCliente(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cliente não encontrado. Faça o registro primeiro.'
      });
    });

    it('deve retornar erro 401 se senha estiver incorreta', async () => {
      const req = mockRequest({ 
        email: 'cliente@email.com', 
        senha: 'senha_errada' 
      });
      const res = mockResponse();

      const mockCliente = {
        _id: new mongoose.Types.ObjectId(),
        email: 'cliente@email.com',
        senha: 'senha_correta'
      };

      Cliente.findOne.mockResolvedValue(mockCliente);

      await ClienteController.loginCliente(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Senha incorreta'
      });
    });
  });

  describe('📋 listarClientes()', () => {
    it('deve retornar lista de clientes', async () => {
      const mockClientes = [
        {
          _id: new mongoose.Types.ObjectId(),
          nome: 'Cliente 1',
          email: 'c1@email.com',
          senha: 'senha1',
          tipo: 'cliente',
          capibas: 50,
          tarefasCompletas: 2
        },
        {
          _id: new mongoose.Types.ObjectId(),
          nome: 'Cliente 2',
          email: 'c2@email.com',
          senha: 'senha2',
          tipo: 'cliente',
          capibas: 100,
          tarefasCompletas: 5
        }
      ];

      const req = mockRequest();
      const res = mockResponse();

      Cliente.find.mockResolvedValue(mockClientes);

      await ClienteController.listarClientes(req, res);

      expect(Cliente.find).toHaveBeenCalledWith({}, {
        nome: 1,
        senha: 1,
        email: 1,
        senha: 1,
        capibas: 1,
        tipo: 1,
        tarefasCompletas: 1
      });
      expect(res.json).toHaveBeenCalledWith(mockClientes);
    });

    it('deve retornar array vazio quando não houver clientes', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Cliente.find.mockResolvedValue([]);

      await ClienteController.listarClientes(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('deve tratar erro ao listar clientes', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Cliente.find.mockRejectedValue(new Error('Erro de banco'));

      await ClienteController.listarClientes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao buscar clientes'
      });
    });
  });

  describe('🔍 buscarClientePorEmail()', () => {
    it('deve buscar cliente por email existente', async () => {
      const email = 'teste@teste.com';
      const mockCliente = {
        _id: new mongoose.Types.ObjectId(),
        nome: 'Cliente Teste',
        email,
        senha: '123',
        tipo: 'cliente',
        capibas: 200,
        tarefasCompletas: 4,
        tarefasConcluidas: []
      };

      const req = mockRequest({}, { email });
      const res = mockResponse();

      Cliente.findOne.mockResolvedValue(mockCliente);

      await ClienteController.buscarClientePorEmail(req, res);

      expect(Cliente.findOne).toHaveBeenCalledWith({ email });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        user: expect.objectContaining({ email })
      }));
    });

    it('deve retornar 404 para email não encontrado', async () => {
      const req = mockRequest({}, { email: 'naoexiste@teste.com' });
      const res = mockResponse();

      Cliente.findOne.mockResolvedValue(null);

      await ClienteController.buscarClientePorEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cliente não encontrado'
      });
    });
  });

  describe('🔍 buscarClientePorId()', () => {
    const clienteId = new mongoose.Types.ObjectId();

    it('deve buscar cliente por ID existente', async () => {
      const mockCliente = {
        _id: clienteId,
        nome: 'Cliente por ID',
        email: 'id@teste.com',
        senha: '123',
        tipo: 'cliente',
        capibas: 300,
        tarefasCompletas: 6,
        tarefasConcluidas: ['t1', 't2', 't3']
      };

      const req = mockRequest({}, { id: clienteId.toString() });
      const res = mockResponse();

      Cliente.findById.mockResolvedValue(mockCliente);

      await ClienteController.buscarClientePorId(req, res);

      expect(Cliente.findById).toHaveBeenCalledWith(clienteId.toString());
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        user: expect.objectContaining({ id: clienteId })
      }));
    });

    it('deve retornar 404 para cliente não encontrado', async () => {
      const req = mockRequest({}, { id: clienteId.toString() });
      const res = mockResponse();

      Cliente.findById.mockResolvedValue(null);

      await ClienteController.buscarClientePorId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cliente não encontrado'
      });
    });
  });

  describe('🎯 concluirTarefa()', () => {
    const clienteId = new mongoose.Types.ObjectId();
    const tarefaId = 'tarefa-123';
    const capibas = 50;

    it('deve concluir tarefa e adicionar capibas', async () => {
      const mockCliente = {
        _id: clienteId,
        nome: 'Cliente Testador',
        tarefasConcluidas: [],
        capibas: 100,
        tarefasCompletas: 2,
        save: jest.fn().mockResolvedValue(true)
      };

      const req = mockRequest(
        { tarefaId, capibas },
        { id: clienteId.toString() }
      );
      const res = mockResponse();

      Cliente.findById.mockResolvedValue(mockCliente);

      await ClienteController.concluirTarefa(req, res);

      expect(Cliente.findById).toHaveBeenCalledWith(clienteId.toString());
      expect(mockCliente.tarefasConcluidas).toContain(tarefaId);
      expect(mockCliente.capibas).toBe(150); // 100 + 50
      expect(mockCliente.tarefasCompletas).toBe(3); // 2 + 1
      expect(mockCliente.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tarefa concluída com sucesso',
        capibas: 150,
        tarefasCompletas: 3,
        tarefasConcluidas: [tarefaId]
      });
    });

    it('deve retornar erro 400 se tarefa já foi concluída', async () => {
      const mockCliente = {
        _id: clienteId,
        nome: 'Cliente Testador',
        tarefasConcluidas: [tarefaId],
        capibas: 100,
        tarefasCompletas: 2,
        save: jest.fn()
      };

      const req = mockRequest(
        { tarefaId, capibas },
        { id: clienteId.toString() }
      );
      const res = mockResponse();

      Cliente.findById.mockResolvedValue(mockCliente);

      await ClienteController.concluirTarefa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tarefa já concluída',
        capibas: 100,
        tarefasCompletas: 2,
        tarefasConcluidas: [tarefaId]
      });
      expect(mockCliente.save).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 se faltar tarefaId ou capibas', async () => {
      const testCases = [
        { body: { capibas: 50 }, expectedError: 'tarefaId e capibas são obrigatórios' },
        { body: { tarefaId: 't123' }, expectedError: 'tarefaId e capibas são obrigatórios' },
        { body: {}, expectedError: 'tarefaId e capibas são obrigatórios' }
      ];

      for (const testCase of testCases) {
        const req = mockRequest(testCase.body, { id: clienteId.toString() });
        const res = mockResponse();

        await ClienteController.concluirTarefa(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: testCase.expectedError
        });
      }
    });

    it('deve retornar erro 404 se cliente não for encontrado', async () => {
      const req = mockRequest(
        { tarefaId, capibas },
        { id: clienteId.toString() }
      );
      const res = mockResponse();

      Cliente.findById.mockResolvedValue(null);

      await ClienteController.concluirTarefa(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cliente não encontrado'
      });
    });
  });

  describe('🗑️ deletarCliente()', () => {
    const clienteId = new mongoose.Types.ObjectId();

    it('deve deletar cliente existente', async () => {
      const mockCliente = {
        _id: clienteId,
        nome: 'Cliente para deletar',
        email: 'deletar@teste.com'
      };

      const req = mockRequest({}, { id: clienteId.toString() });
      const res = mockResponse();

      Cliente.findById.mockResolvedValue(mockCliente);
      Cliente.findByIdAndDelete.mockResolvedValue(mockCliente);

      await ClienteController.deletarCliente(req, res);

      expect(Cliente.findById).toHaveBeenCalledWith(clienteId.toString());
      expect(Cliente.findByIdAndDelete).toHaveBeenCalledWith(clienteId.toString());
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cliente deletado com sucesso'
      });
    });

    it('deve retornar erro 404 se cliente não existir', async () => {
      const req = mockRequest({}, { id: clienteId.toString() });
      const res = mockResponse();

      Cliente.findById.mockResolvedValue(null);

      await ClienteController.deletarCliente(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cliente não encontrado'
      });
      expect(Cliente.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('deve tratar erro ao deletar cliente', async () => {
      const mockCliente = {
        _id: clienteId,
        nome: 'Cliente'
      };

      const req = mockRequest({}, { id: clienteId.toString() });
      const res = mockResponse();

      Cliente.findById.mockResolvedValue(mockCliente);
      Cliente.findByIdAndDelete.mockRejectedValue(new Error('Erro de banco'));

      await ClienteController.deletarCliente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro ao deletar cliente'
      });
    });
  });
});