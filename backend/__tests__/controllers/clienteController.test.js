// 1. IMPORTAÇÕES SIMPLES
const ClienteController = require('../../controllers/clienteController');

// 2. MOCK DIRETO DO MODEL
jest.mock('../../models/clienteModel', () => {
  return {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndDelete: jest.fn()
  };
});

const Cliente = require('../../models/clienteModel');

// 3. TESTES DIRETOS
describe('ClienteController', () => {
  
  // Funções auxiliares simples
  const criarReq = (body = {}, params = {}) => ({ body, params });
  
  const criarRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  // Limpar mocks entre testes
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTE 1: REGISTRAR CLIENTE ==========
  describe('registrarCliente()', () => {
    test('deve registrar cliente com nome e email válidos', async () => {
      // Arrange (Preparar)
      const req = criarReq({ 
        nome: 'João Silva', 
        email: 'joao@email.com',
        senha: '123456' 
      });
      const res = criarRes();

      // Mock: cliente não existe
      Cliente.findOne.mockResolvedValue(null);

      // Mock do cliente salvo
      const clienteMock = {
        _id: 'cliente123',
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: '123456',
        tipo: 'cliente',
        capibas: 0,
        tarefasCompletas: 0,
        tarefasConcluidas: [],
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock do constructor
      Cliente.mockImplementation(() => clienteMock);

      // Act (Agir)
      await ClienteController.registrarCliente(req, res);

      // Assert (Verificar)
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cliente registrado com sucesso",
        user: {
          id: 'cliente123',
          nome: 'João Silva',
          email: 'joao@email.com',
          senha: '123456',
          tipo: 'cliente',
          capibas: 0,
          tarefasCompletas: 0
        }
      });
    });

    test('deve retornar erro 400 se faltar nome ou email', async () => {
      // Teste sem nome
      const req1 = criarReq({ email: 'teste@email.com' });
      const res1 = criarRes();
      await ClienteController.registrarCliente(req1, res1);
      expect(res1.status).toHaveBeenCalledWith(400);
      expect(res1.json).toHaveBeenCalledWith({ 
        message: "Nome, email e senha são obrigatórios" 
      });

      // Teste sem email
      const req2 = criarReq({ nome: 'Teste' });
      const res2 = criarRes();
      await ClienteController.registrarCliente(req2, res2);
      expect(res2.status).toHaveBeenCalledWith(400);
    });

    test('deve retornar erro 400 se cliente já existir', async () => {
      const req = criarReq({ 
        nome: 'Maria', 
        email: 'existente@email.com',
        senha: 'maria123' 
      });
      const res = criarRes();

      // Mock: cliente JÁ existe
      Cliente.findOne.mockResolvedValue({
        _id: '123',
        email: 'existente@email.com'
      });

      await ClienteController.registrarCliente(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cliente já existe com este email"
      });
    });
  });

  // ========== TESTE 2: LOGIN CLIENTE ==========
  describe('loginCliente()', () => {
    test('deve fazer login com email válido', async () => {
      const req = criarReq({ email: 'cliente@email.com' });
      const res = criarRes();

      // Mock cliente encontrado
      Cliente.findOne.mockResolvedValue({
        _id: 'cliente123',
        nome: 'Cliente Teste',
        email: 'cliente@email.com',
        senha: 'teste',
        tipo: 'cliente',
        capibas: 100,
        tarefasCompletas: 5,
        tarefasConcluidas: ['t1', 't2']
      });

      await ClienteController.loginCliente(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Login realizado com sucesso",
        user: {
          id: 'cliente123',
          nome: 'Cliente Teste',
          email: 'cliente@email.com',
          senha: 'teste',
          tipo: 'cliente',
          capibas: 100,
          tarefasCompletas: 5,
          tarefasConcluidas: ['t1', 't2']
        }
      });
    });

    test('deve retornar erro 400 se email não for fornecido', async () => {
      const req = criarReq({}); // Email vazio
      const res = criarRes();

      await ClienteController.loginCliente(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email é obrigatório"
      });
    });

    test('deve retornar erro 400 se cliente não existir', async () => {
      const req = criarReq({ email: 'naoexiste@email.com' });
      const res = criarRes();

      // Mock: cliente NÃO encontrado
      Cliente.findOne.mockResolvedValue(null);

      await ClienteController.loginCliente(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cliente não encontrado. Faça o registro primeiro."
      });
    });
  });

  // ========== TESTE 3: LISTAR CLIENTES ==========
  describe('listarClientes()', () => {
    test('deve listar todos os clientes', async () => {
      const req = criarReq();
      const res = criarRes();

      // Mock lista de clientes
      Cliente.find.mockResolvedValue([
        {
          _id: '1',
          nome: 'Cliente 1',
          email: 'c1@email.com',
          senha: '11',
          capibas: 50,
          tarefasCompletas: 2,
          tipo: 'cliente'
        },
        {
          _id: '2',
          nome: 'Cliente 2',
          email: 'c2@email.com',
          senha: '12',
          capibas: 100,
          tarefasCompletas: 5,
          tipo: 'cliente'
        }
      ]);

      await ClienteController.listarClientes(req, res);

      expect(res.json).toHaveBeenCalled();
      expect(Cliente.find).toHaveBeenCalledWith({}, {
        nome: 1,
        email: 1,
        senha: 1,
        capibas: 1,
        tarefasCompletas: 1,
        tipo: 1
      });
    });
  });

  // ========== TESTE 4: CONCLUIR TAREFA ==========
  describe('concluirTarefa()', () => {
    test('deve adicionar capibas ao concluir tarefa', async () => {
      const req = criarReq(
        { tarefaId: 'tarefa123', capibas: 50 },
        { id: 'cliente123' }
      );
      const res = criarRes();

      // Mock cliente
      const clienteMock = {
        _id: 'cliente123',
        nome: 'Teste',
        tarefasConcluidas: [],
        capibas: 100,
        tarefasCompletas: 2,
        save: jest.fn().mockResolvedValue(true)
      };

      Cliente.findById.mockResolvedValue(clienteMock);

      await ClienteController.concluirTarefa(req, res);

      // Verifica se adicionou a tarefa
      expect(clienteMock.tarefasConcluidas).toContain('tarefa123');
      // Verifica se adicionou capibas (100 + 50)
      expect(clienteMock.capibas).toBe(150);
      // Verifica se incrementou tarefas completas
      expect(clienteMock.tarefasCompletas).toBe(3);
      expect(clienteMock.save).toHaveBeenCalled();
    });

    test('deve retornar erro se tarefa já foi concluída', async () => {
      const req = criarReq(
        { tarefaId: 'tarefa123', capibas: 50 },
        { id: 'cliente123' }
      );
      const res = criarRes();

      // Mock cliente que JÁ concluiu esta tarefa
      const clienteMock = {
        _id: 'cliente123',
        nome: 'Teste',
        tarefasConcluidas: ['tarefa123'], // JÁ TEM!
        capibas: 100,
        tarefasCompletas: 2
      };

      Cliente.findById.mockResolvedValue(clienteMock);

      await ClienteController.concluirTarefa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tarefa já concluída",
        capibas: 100,
        tarefasCompletas: 2,
        tarefasConcluidas: ['tarefa123']
      });
    });

    test('deve retornar erro se faltar tarefaId ou capibas', async () => {
      // Teste sem tarefaId
      const req1 = criarReq(
        { capibas: 50 }, // falta tarefaId
        { id: 'cliente123' }
      );
      const res1 = criarRes();
      
      await ClienteController.concluirTarefa(req1, res1);
      expect(res1.status).toHaveBeenCalledWith(400);
      expect(res1.json).toHaveBeenCalledWith({
        message: "tarefaId e capibas são obrigatórios"
      });

      // Teste sem capibas
      const req2 = criarReq(
        { tarefaId: 't123' }, // falta capibas
        { id: 'cliente123' }
      );
      const res2 = criarRes();
      
      await ClienteController.concluirTarefa(req2, res2);
      expect(res2.status).toHaveBeenCalledWith(400);
    });
  });

  // ========== TESTE 5: DELETAR CLIENTE ==========
  describe('deletarCliente()', () => {
    test('deve deletar cliente existente', async () => {
      const req = criarReq({}, { id: 'cliente123' });
      const res = criarRes();

      // Mock cliente existe
      Cliente.findById.mockResolvedValue({ _id: 'cliente123' });
      Cliente.findByIdAndDelete = jest.fn().mockResolvedValue(true);

      await ClienteController.deletarCliente(req, res);

      expect(Cliente.findByIdAndDelete).toHaveBeenCalledWith('cliente123');
      expect(res.json).toHaveBeenCalledWith({
        message: "Cliente deletado com sucesso"
      });
    });

    test('deve retornar erro 404 se cliente não existir', async () => {
      const req = criarReq({}, { id: 'naoexiste' });
      const res = criarRes();

      // Mock: cliente NÃO encontrado
      Cliente.findById.mockResolvedValue(null);

      await ClienteController.deletarCliente(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cliente não encontrado"
      });
    });
  });
});