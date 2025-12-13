// __tests__/controllers/adminController.test.js

// 1. IMPORTAÇÕES
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const AdminController = require('../../controllers/adminController');
const Admin = require('../../models/adminModel');

// 2. CONFIGURAR APP EXPRESS PARA TESTES
const app = express();
app.use(express.json());

// 3. DEFINIR ROTAS (igual às suas routes/adminRoutes.js)
app.post('/admins/registrar', AdminController.registrarAdmin);
app.post('/admins/login', AdminController.loginAdmin);
app.get('/admins', AdminController.listarAdmins);
app.get('/admins/email/:email', AdminController.buscarAdminPorEmail);
app.get('/admins/:id', AdminController.buscarAdminPorId);
app.put('/admins/:id/concluir-tarefa', AdminController.concluirTarefa);
app.delete('/admins/:id', AdminController.deletarAdmin);

// 4. MOCK DO MODEL ADMIN (IMPORTANTE!)
jest.mock('../../models/adminModel');

// 5. DESCRIÇÃO DOS TESTES
describe('AdminController', () => {
  // Limpar mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTES PARA registrarAdmin ==========
  describe('POST /admins/registrar', () => {
    it('deve registrar um novo admin com dados válidos', async () => {
      // 1. Dados de teste
      const mockAdminData = {
        nome: 'Admin Teste',
        email: 'admin@teste.com'
      };

      // 2. Mock do Admin.findOne (admin não existe)
      Admin.findOne.mockResolvedValue(null);

      // 3. Mock do Admin.save
      const mockSavedAdmin = {
        _id: new mongoose.Types.ObjectId(),
        nome: mockAdminData.nome,
        email: mockAdminData.email,
        tipo: 'admin',
        permissoes: ['ler', 'criar', 'deletar'],
        tarefasCompletas: 0,
        save: jest.fn().mockResolvedValue(true)
      };

      // 4. Mock do construtor Admin
      Admin.mockImplementation(() => mockSavedAdmin);

      // 5. Fazer requisição
      const response = await request(app)
        .post('/admins/registrar')
        .send(mockAdminData)
        .expect('Content-Type', /json/)
        .expect(201);

      // 6. Verificações
      expect(response.body.message).toBe('Admin registrado com sucesso');
      expect(response.body.user.nome).toBe(mockAdminData.nome);
      expect(response.body.user.email).toBe(mockAdminData.email);
      expect(response.body.user.tipo).toBe('admin');
      expect(Admin.findOne).toHaveBeenCalledWith({ email: mockAdminData.email });
    });

    it('deve retornar erro 400 se nome estiver faltando', async () => {
      const response = await request(app)
        .post('/admins/registrar')
        .send({ email: 'teste@email.com' })
        .expect(400);

      expect(response.body.message).toBe('Nome é obrigatório');
    });

    it('deve retornar erro 400 se email estiver faltando', async () => {
      const response = await request(app)
        .post('/admins/registrar')
        .send({ nome: 'Admin Teste' })
        .expect(400);

      expect(response.body.message).toBe('Email é obrigatório');
    });

    it('deve retornar erro 400 se admin já existir', async () => {
      const mockAdmin = {
        _id: new mongoose.Types.ObjectId(),
        nome: 'Admin Existente',
        email: 'existente@teste.com'
      };

      Admin.findOne.mockResolvedValue(mockAdmin);

      const response = await request(app)
        .post('/admins/registrar')
        .send({
          nome: 'Novo Admin',
          email: 'existente@teste.com' // Email já existe
        })
        .expect(400);

      expect(response.body.message).toBe('Admin já existe com este email');
    });

    it('deve retornar erro 500 em caso de erro interno', async () => {
      Admin.findOne.mockRejectedValue(new Error('Erro de banco'));

      const response = await request(app)
        .post('/admins/registrar')
        .send({
          nome: 'Admin Teste',
          email: 'teste@email.com'
        })
        .expect(500);

      expect(response.body.message).toBe('Erro interno do servidor');
    });
  });

  // ========== TESTES PARA loginAdmin ==========
  describe('POST /admins/login', () => {
    it('deve fazer login com email válido', async () => {
      const mockAdmin = {
        _id: new mongoose.Types.ObjectId(),
        nome: 'Admin Teste',
        email: 'admin@teste.com',
        tipo: 'admin',
        permissoes: ['ler', 'criar', 'deletar'],
        tarefasCompletas: 5,
        tarefasConcluidas: ['tarefa1', 'tarefa2']
      };

      Admin.findOne.mockResolvedValue(mockAdmin);

      const response = await request(app)
        .post('/admins/login')
        .send({ email: 'admin@teste.com' })
        .expect(200);

      expect(response.body.message).toBe('Login realizado com sucesso');
      expect(response.body.user.email).toBe('admin@teste.com');
      expect(response.body.user.tarefasCompletas).toBe(5);
      expect(Admin.findOne).toHaveBeenCalledWith({ email: 'admin@teste.com' });
    });

    it('deve retornar erro 400 se email não for fornecido', async () => {
      const response = await request(app)
        .post('/admins/login')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Email é obrigatório');
    });

    it('deve retornar erro 400 se admin não for encontrado', async () => {
      Admin.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/admins/login')
        .send({ email: 'naoexiste@teste.com' })
        .expect(400);

      expect(response.body.message).toBe('Admin não encontrado. Faça o registro primeiro.');
    });
  });

  // ========== TESTES PARA listarAdmins ==========
  describe('GET /admins', () => {
    it('deve listar todos os admins', async () => {
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

      const response = await request(app)
        .get('/admins')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(Admin.find).toHaveBeenCalledWith({}, {
        nome: 1,
        email: 1,
        permissoes: 1,
        tipo: 1,
        tarefasCompletas: 1
      });
    });

    it('deve retornar array vazio se não houver admins', async () => {
      Admin.find.mockResolvedValue([]);

      const response = await request(app)
        .get('/admins')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  // ========== TESTES PARA buscarAdminPorEmail ==========
  describe('GET /admins/email/:email', () => {
    it('deve buscar admin por email com sucesso', async () => {
      const mockAdmin = {
        _id: new mongoose.Types.ObjectId(),
        nome: 'Admin Teste',
        email: 'teste@email.com',
        tipo: 'admin',
        permissoes: ['ler', 'criar'],
        tarefasCompletas: 3,
        tarefasConcluidas: []
      };

      Admin.findOne.mockResolvedValue(mockAdmin);

      const response = await request(app)
        .get('/admins/email/teste@email.com')
        .expect(200);

      expect(response.body.user.email).toBe('teste@email.com');
      expect(Admin.findOne).toHaveBeenCalledWith({ email: 'teste@email.com' });
    });

    it('deve retornar 404 se admin não for encontrado', async () => {
      Admin.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/admins/email/naoexiste@email.com')
        .expect(404);

      expect(response.body.message).toBe('Admin não encontrado');
    });
  });

  // ========== TESTES PARA buscarAdminPorId ==========
  describe('GET /admins/:id', () => {
    const validId = new mongoose.Types.ObjectId();
    const invalidId = 'id-invalido-123';

    it('deve buscar admin por ID válido', async () => {
      const mockAdmin = {
        _id: validId,
        nome: 'Admin por ID',
        email: 'id@teste.com',
        tipo: 'admin',
        permissoes: ['ler'],
        tarefasCompletas: 1,
        tarefasConcluidas: []
      };

      Admin.findById.mockResolvedValue(mockAdmin);

      const response = await request(app)
        .get(`/admins/${validId}`)
        .expect(200);

      expect(response.body.user.id).toBe(validId.toString());
    });

    it('deve retornar 400 para ID inválido', async () => {
      const response = await request(app)
        .get(`/admins/${invalidId}`)
        .expect(400);

      expect(response.body.message).toBe('ID do admin inválido');
    });

    it('deve retornar 404 se admin não for encontrado', async () => {
      Admin.findById.mockResolvedValue(null);

      const response = await request(app)
        .get(`/admins/${validId}`)
        .expect(404);

      expect(response.body.message).toBe('Admin não encontrado');
    });
  });

  // ========== TESTES PARA concluirTarefa ==========
  describe('PUT /admins/:id/concluir-tarefa', () => {
    const adminId = new mongoose.Types.ObjectId();
    const tarefaId = 'tarefa-123';

    it('deve permitir que admin teste uma tarefa', async () => {
      const mockAdmin = {
        _id: adminId,
        nome: 'Admin Testador',
        email: 'testador@email.com',
        tarefasConcluidas: [],
        tarefasCompletas: 0,
        ultimoAcesso: null,
        save: jest.fn().mockResolvedValue(true)
      };

      Admin.findById.mockResolvedValue(mockAdmin);

      const response = await request(app)
        .put(`/admins/${adminId}/concluir-tarefa`)
        .send({ tarefaId })
        .expect(200);

      expect(response.body.message).toBe('Tarefa testada com sucesso');
      expect(response.body.tarefasCompletas).toBe(1);
      expect(response.body.observacao).toBe('Admin não recebe capibas - apenas teste');
      expect(mockAdmin.save).toHaveBeenCalled();
    });

    it('deve retornar erro se tarefa já foi testada', async () => {
      const mockAdmin = {
        _id: adminId,
        nome: 'Admin Testador',
        tarefasConcluidas: [tarefaId], // Já testou esta tarefa
        tarefasCompletas: 1,
        save: jest.fn()
      };

      Admin.findById.mockResolvedValue(mockAdmin);

      const response = await request(app)
        .put(`/admins/${adminId}/concluir-tarefa`)
        .send({ tarefaId })
        .expect(400);

      expect(response.body.message).toBe('Tarefa já testada');
      expect(response.body.tarefasCompletas).toBe(1);
    });

    it('deve retornar 400 se tarefaId não for fornecido', async () => {
      const response = await request(app)
        .put(`/admins/${adminId}/concluir-tarefa`)
        .send({})
        .expect(400);

      expect(response.body.message).toBe('ID da tarefa é obrigatório');
    });

    it('deve retornar 404 se admin não for encontrado', async () => {
      Admin.findById.mockResolvedValue(null);

      const response = await request(app)
        .put(`/admins/${adminId}/concluir-tarefa`)
        .send({ tarefaId })
        .expect(404);

      expect(response.body.message).toBe('Admin não encontrado');
    });
  });

  // ========== TESTES PARA deletarAdmin ==========
  describe('DELETE /admins/:id', () => {
    const adminId = new mongoose.Types.ObjectId();

    it('deve deletar admin com ID válido', async () => {
        const mockAdmin = {
        _id: adminId,
        nome: 'Admin para deletar'
        };

        // Mock do findById (para verificar se admin existe)
        Admin.findById.mockResolvedValue(mockAdmin);
        
        // Mock do findByIdAndDelete
        Admin.findByIdAndDelete.mockResolvedValue(mockAdmin);

        const req = criarReq({}, { id: adminId.toString() });
        const res = criarRes();

        await AdminController.deletarAdmin(req, res);

        expect(res.json).toHaveBeenCalledWith({
        message: "Admin deletado com sucesso"
        });
        
        // Verifica se findById foi chamado
        expect(Admin.findById).toHaveBeenCalledWith(adminId.toString());
        
        // Verifica se findByIdAndDelete foi chamado
        expect(Admin.findByIdAndDelete).toHaveBeenCalledWith(adminId.toString());
    });


    it('deve retornar 404 se admin não existir', async () => {
      Admin.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/admins/${adminId}`)
        .expect(404);

      expect(response.body.message).toBe('Admin não encontrado');
    });
  });
});