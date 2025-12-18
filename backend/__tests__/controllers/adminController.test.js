// __tests__/controllers/adminController.test.js
const mongoose = require('mongoose');
const AdminController = require('../../controllers/adminController');
const Admin = require('../../models/adminModel');

// Mock completo do model Admin
jest.mock('../../models/adminModel');

// Funções helper para criar req/res mockadas
const criarReq = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
  user: body.user || null
});

const criarRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('📁 AdminController - Testes Unitários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('🔐 Operações de Autenticação', () => {
    describe('registrarAdmin()', () => {
      it('deve registrar admin com dados válidos', async () => {
        const mockAdminData = {
          nome: 'Admin Teste',
          email: 'admin@teste.com',
          senha: 'senha123'
        };

        const mockAdmin = {
          _id: new mongoose.Types.ObjectId(),
          ...mockAdminData,
          tipo: 'admin',
          permissoes: ['criar_pinos', 'editar_pinos', 'deletar_pinos', 'gerenciar_usuarios'],
          tarefasCompletas: 0,
          tarefasConcluidas: [],
          save: jest.fn().mockResolvedValue(true)
        };

        Admin.findOne.mockResolvedValue(null);
        Admin.mockImplementation(() => mockAdmin);

        const req = criarReq(mockAdminData);
        const res = criarRes();

        await AdminController.registrarAdmin(req, res);

        expect(Admin.findOne).toHaveBeenCalledWith({ email: mockAdminData.email });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          message: 'Admin registrado com sucesso',
          user: expect.objectContaining({
            nome: mockAdminData.nome,
            email: mockAdminData.email,
            tipo: 'admin'
          })
        }));
      });

      it('deve falhar ao registrar admin com email existente', async () => {
        const mockAdminData = {
          nome: 'Admin Existente',
          email: 'existente@teste.com',
          senha: 'senha123'
        };

        Admin.findOne.mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          ...mockAdminData
        });

        const req = criarReq(mockAdminData);
        const res = criarRes();

        await AdminController.registrarAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Admin já existe com este email'
        });
      });

      it('deve validar campos obrigatórios', async () => {
        const testCases = [
          { data: { email: 'teste@teste.com', senha: '123' }, expectedError: 'Nome é obrigatório' },
          { data: { nome: 'Teste', senha: '123' }, expectedError: 'Email é obrigatório' },
          { data: { nome: 'Teste', email: 'teste@teste.com' }, expectedError: 'Senha é obrigatória' }
        ];

        for (const testCase of testCases) {
          const req = criarReq(testCase.data);
          const res = criarRes();

          await AdminController.registrarAdmin(req, res);

          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({
            message: testCase.expectedError
          });
        }
      });
    });

    describe('loginAdmin()', () => {
      it('deve fazer login com credenciais válidas', async () => {
        const mockCredentials = {
          email: 'admin@teste.com',
          senha: 'senha123'
        };

        const mockAdmin = {
          _id: new mongoose.Types.ObjectId(),
          nome: 'Admin Teste',
          email: mockCredentials.email,
          senha: mockCredentials.senha,
          tipo: 'admin',
          permissoes: ['criar_pinos'],
          tarefasCompletas: 5,
          tarefasConcluidas: ['tarefa1', 'tarefa2']
        };

        Admin.findOne.mockResolvedValue(mockAdmin);

        const req = criarReq(mockCredentials);
        const res = criarRes();

        await AdminController.loginAdmin(req, res);

        expect(Admin.findOne).toHaveBeenCalledWith({ email: mockCredentials.email });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          message: 'Login realizado com sucesso',
          user: expect.objectContaining({
            email: mockCredentials.email
          })
        }));
      });

      it('deve falhar com senha incorreta', async () => {
        const mockCredentials = {
          email: 'admin@teste.com',
          senha: 'senha_errada'
        };

        const mockAdmin = {
          _id: new mongoose.Types.ObjectId(),
          email: mockCredentials.email,
          senha: 'senha_correta'
        };

        Admin.findOne.mockResolvedValue(mockAdmin);

        const req = criarReq(mockCredentials);
        const res = criarRes();

        await AdminController.loginAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Senha incorreta'
        });
      });

      it('deve falhar com admin não encontrado', async () => {
        Admin.findOne.mockResolvedValue(null);

        const req = criarReq({ email: 'naoexiste@teste.com', senha: '123' });
        const res = criarRes();

        await AdminController.loginAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Admin não encontrado. Faça o registro primeiro.'
        });
      });
    });
  });

  describe('📋 Operações de Gerenciamento', () => {
    describe('listarAdmins()', () => {
      it('deve retornar lista de admins', async () => {
        const mockAdmins = [
          {
            _id: new mongoose.Types.ObjectId(),
            nome: 'Admin 1',
            email: 'admin1@teste.com',
            tipo: 'admin',
            permissoes: ['ler'],
            tarefasCompletas: 2
          },
          {
            _id: new mongoose.Types.ObjectId(),
            nome: 'Admin 2',
            email: 'admin2@teste.com',
            tipo: 'admin',
            permissoes: ['ler', 'criar'],
            tarefasCompletas: 5
          }
        ];

        Admin.find.mockResolvedValue(mockAdmins);

        const req = criarReq();
        const res = criarRes();

        await AdminController.listarAdmins(req, res);

        expect(Admin.find).toHaveBeenCalledWith({}, expect.objectContaining({
          nome: 1,
          email: 1,
          senha: 1,
          permissoes: 1,
          tipo: 1,
          tarefasCompletas: 1
        }));
        expect(res.json).toHaveBeenCalledWith(mockAdmins);
      });

      it('deve retornar array vazio quando não houver admins', async () => {
        Admin.find.mockResolvedValue([]);

        const req = criarReq();
        const res = criarRes();

        await AdminController.listarAdmins(req, res);

        expect(res.json).toHaveBeenCalledWith([]);
      });
    });

    describe('buscarAdminPorEmail()', () => {
      it('deve buscar admin por email existente', async () => {
        const email = 'teste@teste.com';
        const mockAdmin = {
          _id: new mongoose.Types.ObjectId(),
          nome: 'Admin Teste',
          email,
          senha: '123',
          tipo: 'admin',
          permissoes: ['ler'],
          tarefasCompletas: 3,
          tarefasConcluidas: []
        };

        Admin.findOne.mockResolvedValue(mockAdmin);

        const req = criarReq({}, { email });
        const res = criarRes();

        await AdminController.buscarAdminPorEmail(req, res);

        expect(Admin.findOne).toHaveBeenCalledWith({ email });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          user: expect.objectContaining({ email })
        }));
      });

      it('deve retornar 404 para email não encontrado', async () => {
        Admin.findOne.mockResolvedValue(null);

        const req = criarReq({}, { email: 'naoexiste@teste.com' });
        const res = criarRes();

        await AdminController.buscarAdminPorEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Admin não encontrado'
        });
      });
    });

    describe('buscarAdminPorId()', () => {
      const validId = new mongoose.Types.ObjectId();
      const invalidId = 'id-invalido-123';

      it('deve buscar admin por ID válido', async () => {
        const mockAdmin = {
          _id: validId,
          nome: 'Admin por ID',
          email: 'id@teste.com',
          senha: '123',
          tipo: 'admin',
          permissoes: ['ler'],
          tarefasCompletas: 1,
          tarefasConcluidas: []
        };

        Admin.findById.mockResolvedValue(mockAdmin);

        const req = criarReq({}, { id: validId.toString() });
        const res = criarRes();

        await AdminController.buscarAdminPorId(req, res);

        expect(Admin.findById).toHaveBeenCalledWith(validId.toString());
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          user: expect.objectContaining({ id: validId })
        }));
      });

      it('deve retornar 400 para ID inválido', async () => {
        const req = criarReq({}, { id: invalidId });
        const res = criarRes();

        await AdminController.buscarAdminPorId(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'ID do admin inválido'
        });
      });

      it('deve retornar 404 para admin não encontrado', async () => {
        Admin.findById.mockResolvedValue(null);

        const req = criarReq({}, { id: validId.toString() });
        const res = criarRes();

        await AdminController.buscarAdminPorId(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Admin não encontrado'
        });
      });
    });
  });

  describe('🎯 Operações de Tarefas', () => {
    describe('concluirTarefa()', () => {
      const adminId = new mongoose.Types.ObjectId();
      const tarefaId = 'tarefa-123';

      it('deve permitir admin testar tarefa pela primeira vez', async () => {
        const mockAdmin = {
          _id: adminId,
          nome: 'Admin Testador',
          email: 'testador@teste.com',
          tarefasConcluidas: [],
          tarefasCompletas: 0,
          ultimoAcesso: null,
          save: jest.fn().mockResolvedValue(true)
        };

        Admin.findById.mockResolvedValue(mockAdmin);

        const req = criarReq({ tarefaId }, { id: adminId.toString() });
        const res = criarRes();

        await AdminController.concluirTarefa(req, res);

        expect(mockAdmin.tarefasConcluidas).toContain(tarefaId);
        expect(mockAdmin.tarefasCompletas).toBe(1);
        expect(mockAdmin.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          message: 'Tarefa testada com sucesso',
          tarefasCompletas: 1,
          observacao: 'Admin não recebe capibas - apenas teste'
        }));
      });

      it('deve impedir testar tarefa já concluída', async () => {
        const mockAdmin = {
          _id: adminId,
          nome: 'Admin Testador',
          tarefasConcluidas: [tarefaId],
          tarefasCompletas: 1,
          save: jest.fn()
        };

        Admin.findById.mockResolvedValue(mockAdmin);

        const req = criarReq({ tarefaId }, { id: adminId.toString() });
        const res = criarRes();

        await AdminController.concluirTarefa(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Tarefa já testada',
          tarefasCompletas: 1
        });
        expect(mockAdmin.save).not.toHaveBeenCalled();
      });

      it('deve validar tarefaId obrigatório', async () => {
        const req = criarReq({}, { id: adminId.toString() });
        const res = criarRes();

        await AdminController.concluirTarefa(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'ID da tarefa é obrigatório'
        });
      });
    });
  });

  describe('🗑️ Operações de Exclusão', () => {
    describe('deletarAdmin()', () => {
      const adminId = new mongoose.Types.ObjectId();

      it('deve deletar admin existente', async () => {
        const mockAdmin = {
          _id: adminId,
          nome: 'Admin para deletar'
        };

        Admin.findById.mockResolvedValue(mockAdmin);
        Admin.findByIdAndDelete.mockResolvedValue(mockAdmin);

        const req = criarReq({}, { id: adminId.toString() });
        const res = criarRes();

        await AdminController.deletarAdmin(req, res);

        expect(Admin.findById).toHaveBeenCalledWith(adminId.toString());
        expect(Admin.findByIdAndDelete).toHaveBeenCalledWith(adminId.toString());
        expect(res.json).toHaveBeenCalledWith({
          message: 'Admin deletado com sucesso'
        });
      });

      it('deve retornar 404 para admin não encontrado', async () => {
        Admin.findById.mockResolvedValue(null);

        const req = criarReq({}, { id: adminId.toString() });
        const res = criarRes();

        await AdminController.deletarAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Admin não encontrado'
        });
        expect(Admin.findByIdAndDelete).not.toHaveBeenCalled();
      });

      it('deve retornar 400 para ID inválido', async () => {
        const req = criarReq({}, { id: 'id-invalido' });
        const res = criarRes();

        await AdminController.deletarAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'ID do admin inválido'
        });
      });
    });
  });

  describe('⚠️ Tratamento de Erros', () => {
    it('deve tratar erro de banco de dados no registro', async () => {
      Admin.findOne.mockRejectedValue(new Error('Erro de conexão'));

      const req = criarReq({
        nome: 'Admin Teste',
        email: 'teste@teste.com',
        senha: '123'
      });
      const res = criarRes();

      await AdminController.registrarAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erro interno do servidor'
      });
    });

    it('deve tratar erro de duplicação no registro', async () => {
      Admin.findOne.mockRejectedValue({
        code: 11000,
        message: 'Duplicate key error'
      });

      const req = criarReq({
        nome: 'Admin Teste',
        email: 'duplicado@teste.com',
        senha: '123'
      });
      const res = criarRes();

      await AdminController.registrarAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email já está em uso'
      });
    });
  });
});